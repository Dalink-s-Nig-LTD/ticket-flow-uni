import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Send, Paperclip, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

type CreateTicketResponse = {
  ticketId: Id<"tickets">;
  ticket_id: string;
};

const formSchema = z.object({
  matricNumber: z
    .string()
    .min(5, "Matric number is required")
    .regex(
      /^RUN\/[A-Z]+\/\d{2}\/\d{5}$/,
      "Invalid matric number format (e.g., RUN/STA/23/12345)"
    )
    .max(50),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z
    .string()
    .email("Invalid email address")
    .regex(
      /@run\.edu\.ng$/,
      "Must use RUN email address (e.g., name@run.edu.ng)"
    )
    .max(255),
  phone: z.string().optional(),
  department: z.string().min(2, "Please select your department").max(100),
  natureOfComplaint: z.string().min(1, "Please select nature of complaint"),
  subject: z.string().min(5, "Subject must be at least 5 characters").max(200),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000),
});

type FormValues = z.infer<typeof formSchema>;

const natureOptions = [
  "ICT/Portal",
  "Payment/Bursary",
  "Exams/Results",
  "Hostel/Accommodation",
  "Library",
  "Registrar",
  "Others",
];

const FORM_STORAGE_KEY = "createTicket_draft";

const CreateTicket = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [lastSaved, setLastSaved] = useState<string>("");

  const createTicket = useMutation(api.tickets.createTicket);
  const sendEmail = useAction(api.emails.sendTicketEmail);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const getFileUrl = useMutation(api.files.getFileUrl);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      matricNumber: "",
      name: "",
      email: "",
      phone: "",
      department: "",
      natureOfComplaint: "",
      subject: "",
      message: "",
    },
  });

  // Load saved form data on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(FORM_STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        form.reset(parsed);
        setLastSaved("Draft loaded");
        setTimeout(() => setLastSaved(""), 2000);
      }
    } catch (error) {
      console.error("Failed to load saved form data:", error);
    }
  }, [form]);

  // Auto-save form data
  useEffect(() => {
    const subscription = form.watch((values) => {
      try {
        // Only save if at least one field has content
        const hasContent = Object.values(values).some(
          (value) => value && value.toString().trim().length > 0
        );
        if (hasContent) {
          localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(values));
          setLastSaved("Saved");
          setTimeout(() => setLastSaved(""), 1500);
        }
      } catch (error) {
        console.error("Failed to save form data:", error);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error(
          "Only images (JPG, PNG, WEBP), PDF, and Word documents are allowed"
        );
        return;
      }
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadProgress("");
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const now = new Date().toISOString();

      let attachmentUrl: string | undefined;

      // Upload file if selected
      if (selectedFile) {
        try {
          setUploadProgress("Uploading file...");

          // Get upload URL from Convex
          const uploadUrl = await generateUploadUrl();

          // Upload file to Convex storage
          const uploadResult = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": selectedFile.type },
            body: selectedFile,
          });

          if (!uploadResult.ok) {
            throw new Error("File upload failed");
          }

          const { storageId } = await uploadResult.json();

          // Get the file URL
          attachmentUrl = await getFileUrl({ storageId });
          setUploadProgress("File uploaded successfully");
        } catch (uploadError) {
          console.error("File upload error:", uploadError);
          toast.error(
            "Failed to upload file. Ticket will be created without attachment."
          );
        }
      }

      // Create ticket in Convex
      const result = await createTicket({
        matric_number: values.matricNumber,
        name: values.name,
        email: values.email,
        phone: values.phone || undefined,
        department: values.department,
        nature_of_complaint: values.natureOfComplaint,
        subject: values.subject,
        message: values.message,
        attachment_url: attachmentUrl,
      });

      const ticketId = (result as CreateTicketResponse).ticket_id;

      // Send email notification
      try {
        await sendEmail({
          ticketId,
          matricNumber: values.matricNumber,
          name: values.name,
          email: values.email,
          phone: values.phone,
          department: values.department,
          natureOfComplaint: values.natureOfComplaint,
          subject: values.subject,
          message: values.message,
          createdAt: now,
        });
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        toast.warning("Ticket created but email notification may have failed");
      }

      // Clear saved draft after successful submission
      localStorage.removeItem(FORM_STORAGE_KEY);

      toast.success("Ticket submitted successfully!");
      navigate("/confirmation", {
        state: { ticketData: { ticket_id: ticketId, ...values } },
      });
    } catch (error: unknown) {
      console.error("Error submitting ticket:", error);
      let message = "Failed to submit ticket. Please try again.";

      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === "object" && error !== null) {
        const errObj = error as Record<string, unknown>;
        if (typeof errObj.data === "string") {
          message = errObj.data;
        } else if (typeof errObj.data === "object" && errObj.data !== null) {
          const dataObj = errObj.data as Record<string, unknown>;
          if (typeof dataObj.message === "string") {
            message = dataObj.message;
          }
        } else if (typeof errObj.message === "string") {
          message = errObj.message;
        } else {
          try {
            message = JSON.stringify(errObj);
          } catch (_) {
            /* ignore stringify errors */
          }
        }
      } else {
        message = String(error);
      }

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-6 md:py-8 px-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4 md:mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <Card>
          <CardHeader className="space-y-2 md:space-y-3 bg-primary text-primary-foreground rounded-t-lg p-4 md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-xl md:text-3xl font-bold">
                  Create Support Ticket - Existing Student
                </CardTitle>
                <CardDescription className="text-primary-foreground/90 text-sm md:text-base mt-2">
                  Use your RUN matric number and RUN email address. All fields
                  marked with * are required.
                </CardDescription>
              </div>
              {lastSaved && (
                <div className="flex items-center gap-1.5 text-xs bg-primary-foreground/20 text-primary-foreground px-3 py-1.5 rounded-full animate-in fade-in duration-300">
                  <Save className="h-3 w-3" />
                  <span>{lastSaved}</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-4 md:pt-6 p-4 md:p-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 md:space-y-6"
              >
                <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                  <FormField
                    control={form.control}
                    name="matricNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RUN Matric Number *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., RUN/STA/23/12345"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your full name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RUN Email Address *</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="e.g., ades@run.edu.ng"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="+234 800 000 0000"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department/Faculty *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Computer Science"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="natureOfComplaint"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nature of Complaint *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select complaint type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {natureOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Brief description of your issue"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message/Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please provide detailed information about your complaint..."
                          rows={6}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* File Attachment */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Attachment (Optional)
                  </label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          document.getElementById("file-upload")?.click()
                        }
                        disabled={isSubmitting}
                        className="w-full sm:w-auto"
                      >
                        <Paperclip className="mr-2 h-4 w-4" />
                        Choose File
                      </Button>
                      <input
                        id="file-upload"
                        type="file"
                        accept="image/jpeg,image/png,image/jpg,image/webp,application/pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      {selectedFile && (
                        <div className="flex-1 flex items-center gap-2 bg-muted px-3 py-2 rounded-md">
                          <Paperclip className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm truncate flex-1">
                            {selectedFile.name}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={removeFile}
                            disabled={isSubmitting}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    {uploadProgress && (
                      <p className="text-xs text-muted-foreground">
                        {uploadProgress}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Accepted: Images (JPG, PNG, WEBP), PDF, Word documents.
                      Max 10MB.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Submitting..." : "Submit Ticket"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
                    disabled={isSubmitting}
                    className="sm:w-auto"
                  >
                    Reset Form
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateTicket;
