import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { Upload, CheckCircle2, AlertCircle, FileText, Image as ImageIcon } from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ACCEPTED_DOC_TYPES = ["application/pdf", "image/jpeg", "image/png"];

const applySchema = z.object({
  charity_name: z.string().min(2, "Charity name is required"),
  website: z.string().url("Valid URL required").or(z.literal("")),
  contact_email: z.string().email("Valid contact email required"),
  description: z.string().min(20, "Tell us more about your mission (min 20 chars)"),
});

type ApplyValues = z.infer<typeof applySchema>;

export default function Apply() {
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ApplyValues>({
    resolver: zodResolver(applySchema),
    defaultValues: {
      charity_name: "",
      website: "",
      contact_email: "",
      description: "",
    },
  });

  const uploadFile = async (file: File, bucket: string) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(`Error uploading ${bucket}: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const onSubmit = async (values: ApplyValues) => {
    if (!isSupabaseConfigured) {
      toast.error("Supabase is not configured. Please check project settings.");
      return;
    }

    if (!logoFile) {
      toast.warning("Please upload a logo for your charity.");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please login to submit an application.");
        setLoading(false);
        return;
      }

      // 2. Upload Logo
      const logoUrl = await uploadFile(logoFile, "logos");

      // 3. Save to DB
      const { error } = await supabase.from("charity_applications").insert({
        charity_name: values.charity_name,
        website: values.website,
        contact_email: values.contact_email,
        description: values.description,
        logo_url: logoUrl,
        user_id: user.id,
        status: "pending",
      });

      if (error) throw error;

      toast.success("Application submitted successfully!");
      reset();
      setLogoFile(null);
    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error(error.message || "Failed to submit application.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 font-sans">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-serif text-charity-darker mb-4">Partner with Pracima</h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Apply to become a verified charity on our crypto transparency platform. Join the circle of trust.
        </p>
      </div>

      <div className="bg-white border border-charity-muted rounded-[2.5rem] p-8 md:p-12 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Charity Name */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-charity-darker ml-1">Charity Name</label>
              <input
                {...register("charity_name")}
                className={`w-full px-5 py-4 bg-charity-light/50 border ${errors.charity_name ? "border-red-400" : "border-transparent"} rounded-2xl focus:bg-white focus:border-charity-dark outline-none transition-all`}
                placeholder="e.g. Hope For All"
              />
              {errors.charity_name && <p className="text-xs text-red-500 ml-1">{errors.charity_name.message}</p>}
            </div>

            {/* Contact Email */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-charity-darker ml-1">Contact Email</label>
              <input
                {...register("contact_email")}
                className={`w-full px-5 py-4 bg-charity-light/50 border ${errors.contact_email ? "border-red-400" : "border-transparent"} rounded-2xl focus:bg-white focus:border-charity-dark outline-none transition-all`}
                placeholder="admin@charity.org"
              />
              {errors.contact_email && <p className="text-xs text-red-500 ml-1">{errors.contact_email.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Website */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-charity-darker ml-1">Organization Website</label>
              <input
                {...register("website")}
                className={`w-full px-5 py-4 bg-charity-light/50 border ${errors.website ? "border-red-400" : "border-transparent"} rounded-2xl focus:bg-white focus:border-charity-dark outline-none transition-all`}
                placeholder="https://charity.org"
              />
              {errors.website && <p className="text-xs text-red-500 ml-1">{errors.website.message}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-charity-darker ml-1">Mission & Impact Description</label>
            <textarea
              {...register("description")}
              rows={4}
              className={`w-full px-5 py-4 bg-charity-light/50 border ${errors.description ? "border-red-400" : "border-transparent"} rounded-2xl focus:bg-white focus:border-charity-dark outline-none transition-all resize-none`}
              placeholder="Tell us about what you do and who you help..."
            />
            {errors.description && <p className="text-xs text-red-500 ml-1">{errors.description.message}</p>}
          </div>

          <div className="pt-4 px-1">
             {/* Logo Upload */}
             <div className="space-y-3">
                <label className="text-sm font-semibold text-charity-darker ml-1">Charity Logo</label>
                <div 
                  className={`relative border-2 border-dashed ${logoFile ? "border-charity-dark bg-charity-accent/5" : "border-gray-200 bg-charity-light/30"} rounded-3xl p-8 transition-all group flex flex-col items-center text-center cursor-pointer hover:border-charity-dark`}
                  onClick={() => document.getElementById('logo-upload')?.click()}
                >
                   <input 
                    type="file" 
                    id="logo-upload" 
                    hidden 
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                   />
                   {logoFile ? (
                      <>
                        <CheckCircle2 className="h-10 w-10 text-charity-dark mb-2" />
                        <span className="text-sm font-medium text-charity-dark">{logoFile.name}</span>
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setLogoFile(null); }} className="mt-2">Change</Button>
                      </>
                   ) : (
                      <>
                        <ImageIcon className="h-10 w-10 text-gray-400 mb-2 group-hover:text-charity-dark" />
                        <span className="text-sm text-gray-500 font-medium">Upload logo (PNG/JPG)</span>
                        <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-bold">Max 5MB</span>
                      </>
                   )}
                </div>
             </div>
          </div>

          <div className="pt-8">
            <Button 
                type="submit" 
                variant="dark" 
                className="w-full h-16 text-lg rounded-2xl bg-charity-darker group"
                disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Submitting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Submit Application
                  <CheckCircle2 className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}
            </Button>
          </div>
          
        </form>
      </div>

      <div className="mt-12 flex items-start gap-4 p-6 bg-charity-accent/10 rounded-2xl border border-charity-accent/20">
         <AlertCircle className="h-6 w-6 text-charity-dark shrink-0 mt-0.5" />
         <div className="text-sm text-charity-dark/80 leading-relaxed">
            <p className="font-bold mb-1 uppercase tracking-tight">Review Process</p>
            Our team typically reviews applications within 1-3 business days. You will receive an status update via the provided contact email once the verification is complete.
         </div>
      </div>
    </div>
  );
}
