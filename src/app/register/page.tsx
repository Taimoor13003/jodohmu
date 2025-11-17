"use client";

import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { User, Heart, FileText } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

const formSchema = z
  .object({
    fullName: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(8).max(100),
    confirmPassword: z.string().min(8).max(100),
    phone: z.string().min(6).max(20).optional().or(z.literal("")),
    gender: z.enum(["female", "male", "other"]),
    dob: z.string(),
    location: z.string().min(2).max(100).optional().or(z.literal("")),
    profession: z.string().max(100).optional().or(z.literal("")),
    education: z.string().max(120).optional().or(z.literal("")),
    maritalStatus: z.enum(["single", "divorced", "widowed"]),
    height: z
      .string()
      .optional()
      .or(z.literal(""))
      .refine(
        (v) => v === "" || (!Number.isNaN(Number(v)) && Number(v) >= 120 && Number(v) <= 250),
        {
          message: "Height must be between 120 and 250",
        }
      ),
    religion: z.enum(["islam", "christianity", "hinduism", "buddhism", "other"]),
    bio: z.string().max(1000).optional().or(z.literal("")),
    interests: z.string().max(1000).optional().or(z.literal("")),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isLoginPending, setIsLoginPending] = React.useState(false);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      gender: undefined as unknown as FormValues["gender"],
      dob: "",
      location: "",
      profession: "",
      education: "",
      maritalStatus: undefined as unknown as FormValues["maritalStatus"],
      height: "",
      religion: undefined as unknown as FormValues["religion"],
      bio: "",
      interests: "",
    },
  });

  async function onSubmit(values: FormValues) {
    const { email, password, fullName, ...profile } = values;
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: fullName });
    }
    const uid = cred.user.uid;
    await setDoc(doc(db, "profiles", uid), {
      uid,
      fullName,
      email,
      ...profile,
      dob: values.dob,
      height: values.height === "" ? null : Number(values.height),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    router.push("/dashboard");
  }

  const handleGoogleLogin = async () => {
    setIsLoginPending(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
    } finally {
      setIsLoginPending(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-b from-background via-background to-muted/30">
        <div className="container mx-auto max-w-2xl px-4 py-16">
          <Card className="shadow-2xl border-0 bg-gradient-to-br from-card via-card to-[#9B2242]/5 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-[#0b3a86] via-[#0b3a86]/90 to-[#9B2242]/80 text-white relative overflow-hidden">
              <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
              </div>
              <div className="relative z-10 text-center space-y-2">
                <Heart className="w-10 h-10 mx-auto" />
                <CardTitle className="text-2xl md:text-3xl font-serif">{t("register.guard.title")}</CardTitle>
                <p className="text-white/85 text-base md:text-lg max-w-xl mx-auto">{t("register.guard.description")}</p>
              </div>
            </CardHeader>
            <CardFooter className="flex justify-center bg-gradient-to-r from-[#0b3a86]/5 to-[#9B2242]/5 p-8">
              <Button
                type="button"
                size="lg"
                onClick={handleGoogleLogin}
                disabled={isLoginPending}
                className="bg-gradient-to-r from-[#9B2242] to-[#0b3a86] text-white border-0 shadow-lg hover:from-[#861b37] hover:to-[#0a3377]"
              >
                {isLoginPending ? t("register.buttonLoading") : t("register.guard.cta")}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-b from-background via-background to-muted/30">
      <div className="container mx-auto max-w-4xl px-4 py-10 md:py-16">
        <Card className="shadow-2xl border-0 bg-gradient-to-br from-card via-card to-[#9B2242]/5 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#0b3a86] via-[#0b3a86]/90 to-[#9B2242]/80 text-white relative overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
            </div>
            <div className="relative z-10 text-center">
              <div className="flex justify-center mb-3">
                <div className="bg-white/20 rounded-full p-3">
                  <Heart className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl md:text-4xl font-serif">{t("register.title")}</CardTitle>
              <p className="text-white/90 mt-2">{t("register.subtitle")}</p>
            </div>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-8 p-8">
              {/* Account Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-[#9B2242]/20">
                  <div className="bg-gradient-to-r from-[#9B2242] to-[#0b3a86] rounded-full p-2">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-serif font-semibold text-foreground">{t("register.sections.account")}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="fullName" className="text-sm font-medium">
                      Full Name
                    </label>
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      className="focus:ring-2 focus:ring-[#9B2242]/20 focus:border-[#9B2242] transition-all"
                      {...register("fullName")}
                      required
                    />
                    {errors.fullName && (
                      <p className="text-sm text-destructive">{errors.fullName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t("register.fields.emailPlaceholder")}
                      className="focus:ring-2 focus:ring-[#9B2242]/20 focus:border-[#9B2242] transition-all"
                      {...register("email")}
                      required
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium">
                      Password
                    </label>
                    <Input
                      id="password"
                      type="password"
                      placeholder={t("register.fields.passwordPlaceholder")}
                      className="focus:ring-2 focus:ring-[#9B2242]/20 focus:border-[#9B2242] transition-all"
                      {...register("password")}
                      required
                    />
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirm Password
                    </label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder={t("register.fields.confirmPasswordPlaceholder")}
                      className="focus:ring-2 focus:ring-[#9B2242]/20 focus:border-[#9B2242] transition-all"
                      {...register("confirmPassword")}
                      required
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Personal Details Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-[#9B2242]/20">
                  <div className="bg-gradient-to-r from-[#9B2242] to-[#0b3a86] rounded-full p-2">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-serif font-semibold text-foreground">{t("register.sections.personal")}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium">
                      Phone
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder={t("register.fields.phonePlaceholder")}
                      className="focus:ring-2 focus:ring-[#9B2242]/20 focus:border-[#9B2242] transition-all"
                      {...register("phone")}
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive">{errors.phone.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Gender
                    </label>
                    <Controller
                      control={control}
                      name="gender"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>{t("register.fields.gender")}</SelectLabel>
                              <SelectItem value="female">{t("register.options.gender.female")}</SelectItem>
                              <SelectItem value="male">{t("register.options.gender.male")}</SelectItem>
                              <SelectItem value="other">{t("register.options.gender.other")}</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.gender && (
                      <p className="text-sm text-destructive">{errors.gender.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="dob" className="text-sm font-medium">
                      Date of birth
                    </label>
                    <Input
                      id="dob"
                      type="date"
                      className="focus:ring-2 focus:ring-[#9B2242]/20 focus:border-[#9B2242] transition-all"
                      {...register("dob")}
                      required
                    />
                    {errors.dob && (
                      <p className="text-sm text-destructive">{errors.dob.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="location" className="text-sm font-medium">
                      Location
                    </label>
                    <Input
                      id="location"
                      placeholder={t("register.fields.locationPlaceholder")} 
                      className="focus:ring-2 focus:ring-[#9B2242]/20 focus:border-[#9B2242] transition-all"
                      {...register("location")}
                    />
                    {errors.location && (
                      <p className="text-sm text-destructive">{errors.location.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="profession" className="text-sm font-medium">
                      Profession
                    </label>
                    <Input
                      id="profession"
                      placeholder={t("register.fields.professionPlaceholder")}
                      className="focus:ring-2 focus:ring-[#9B2242]/20 focus:border-[#9B2242] transition-all"
                      {...register("profession")}
                    />
                    {errors.profession && (
                      <p className="text-sm text-destructive">{errors.profession.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="education" className="text-sm font-medium">
                      Education
                    </label>
                    <Input
                      id="education"
                      placeholder={t("register.fields.educationPlaceholder")}
                      className="focus:ring-2 focus:ring-[#9B2242]/20 focus:border-[#9B2242] transition-all"
                      {...register("education")}
                    />
                    {errors.education && (
                      <p className="text-sm text-destructive">{errors.education.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Marital status
                    </label>
                    <Controller
                      control={control}
                      name="maritalStatus"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>{t("register.fields.maritalStatus")}</SelectLabel>
                              <SelectItem value="single">{t("register.options.maritalStatus.single")}</SelectItem>
                              <SelectItem value="divorced">{t("register.options.maritalStatus.divorced")}</SelectItem>
                              <SelectItem value="widowed">{t("register.options.maritalStatus.widowed")}</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.maritalStatus && (
                      <p className="text-sm text-destructive">{errors.maritalStatus.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="height" className="text-sm font-medium">
                      Height (cm)
                    </label>
                    <Input
                      id="height"
                      type="number"
                      min={120}
                      max={250}
                      placeholder={t("register.fields.heightPlaceholder")}
                      className="focus:ring-2 focus:ring-[#9B2242]/20 focus:border-[#9B2242] transition-all"
                      {...register("height")}
                    />
                    {errors.height && (
                      <p className="text-sm text-destructive">{errors.height.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Religion
                    </label>
                    <Controller
                      control={control}
                      name="religion"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select religion" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>{t("register.fields.religion")}</SelectLabel>
                              <SelectItem value="islam">{t("register.options.religion.islam")}</SelectItem>
                              <SelectItem value="christianity">{t("register.options.religion.christianity")}</SelectItem>
                              <SelectItem value="hinduism">{t("register.options.religion.hinduism")}</SelectItem>
                              <SelectItem value="buddhism">{t("register.options.religion.buddhism")}</SelectItem>
                              <SelectItem value="other">{t("register.options.religion.other")}</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.religion && (
                      <p className="text-sm text-destructive">{errors.religion.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* About You Section */}
              <div className="space-y-6">
                <div className="flex itemscenter gap-3 pb-2 border-b border-[#9B2242]/20">
                  <div className="bg-gradient-to-r from-[#9B2242] to-[#0b3a86] rounded-full p-2">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-serif font-semibold text-foreground">{t("register.sections.about")}</h3>
                </div>
                <div className="space-y-2">
                  <label htmlFor="bio" className="text-sm font-medium">
                    About you
                  </label>
                  <Textarea
                    id="bio"
                    placeholder={t("register.fields.bioPlaceholder")}
                    className="min-h-28 focus:ring-2 focus:ring-[#9B2242]/20 focus:border-[#9B2242] transition-all"
                    {...register("bio")}
                  />
                  {errors.bio && (
                    <p className="text-sm text-destructive">{errors.bio.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="interests" className="text-sm font-medium">
                    Interests & preferences
                  </label>
                  <Textarea
                    id="interests"
                    placeholder={t("register.fields.interestsPlaceholder")}
                    className="min-h-28 focus:ring-2 focus:ring-[#9B2242]/20 focus:border-[#9B2242] transition-all"
                    {...register("interests")}
                  />
                  {errors.interests && (
                    <p className="text-sm text-destructive">{errors.interests.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-3 bg-gradient-to-r from-[#0b3a86]/5 to-[#9B2242]/5 p-8">
              <Button 
                type="submit" 
                className="px-8 py-3 bg-gradient-to-r from-[#9B2242] to-[#0b3a86] hover:from-[#9B2242]/90 hover:to-[#0b3a86]/90 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create profile"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
