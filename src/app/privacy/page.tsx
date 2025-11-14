import { Metadata } from "next";
import { Shield, Lock, Eye, Users, Settings, Trash2, Info, Phone, Mail, MapPin, Calendar, Globe, UserX } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy - Jodohmu",
  description: "Privacy policy for Jodohmu - Find your soulmate with care, faith, and sincerity.",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#9B2242] via-[#9B2242]/80 to-[#0b3a86]/90 opacity-95"></div>
        <div className="relative bg-gradient-to-br from-[#9B2242]/10 via-transparent to-[#0b3a86]/5">
          <div className="container py-16">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm ring-2 ring-white/20">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-4">
                <h1 className="text-5xl font-serif text-white drop-shadow-lg">Privacy Policy</h1>
                <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                  Your privacy matters to us. We're committed to protecting your personal information with care, faith, and sincerity.
                </p>
                <p className="text-white/70">
                  Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container py-12 max-w-4xl">
        <div className="space-y-12">
          {/* Introduction Card */}
          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Info className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-serif text-foreground">Introduction</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Welcome to Jodohmu. We respect your privacy and are committed to protecting your personal data. 
                  This privacy policy will inform you about how we look after your personal data when you use our 
                  website and tell you about your privacy rights and how the law protects you.
                </p>
              </div>
            </div>
          </div>

          {/* Information We Collect Card */}
          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Eye className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl font-serif text-foreground">Information We Collect</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">Personal Information</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2 text-lg">
                      <li>Name and email address</li>
                      <li>Phone number</li>
                      <li>Profile information including photos, bio, and preferences</li>
                      <li>Age verification information</li>
                      <li>Location information (if provided)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">Usage Data</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2 text-lg">
                      <li>How you interact with our platform</li>
                      <li>Profile views and matches</li>
                      <li>Communication with other users</li>
                      <li>App usage statistics and analytics</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">Technical Data</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2 text-lg">
                      <li>IP address and device information</li>
                      <li>Browser type and version</li>
                      <li>Operating system</li>
                      <li>Cookies and similar tracking technologies</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* How We Use Your Information Card */}
          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Settings className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl font-serif text-foreground">How We Use Your Information</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  We use your personal information to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 text-lg">
                  <li>Provide and maintain our matchmaking service</li>
                  <li>Create and manage your profile</li>
                  <li>Match you with compatible partners</li>
                  <li>Facilitate communication between users</li>
                  <li>Ensure platform safety and prevent fraud</li>
                  <li>Send you service-related notifications</li>
                  <li>Improve our services and user experience</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Data Sharing and Third Parties Card */}
          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl font-serif text-foreground">Data Sharing and Third Parties</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  We may share your information with:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 text-lg">
                  <li><strong>Firebase/Google:</strong> Our database and authentication services are hosted on Firebase. 
                  Google acts as our data processor and stores information on our behalf. 
                  Review their privacy policy at <a href="https://policies.google.com/privacy" className="text-primary hover:underline">policies.google.com/privacy</a></li>
                  <li><strong>Service Providers:</strong> Third-party services that help us operate our platform</li>
                  <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  We never sell your personal information to third parties for marketing purposes.
                </p>
              </div>
            </div>
          </div>

          {/* Data Security Card */}
          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl font-serif text-foreground">Data Security</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  We implement appropriate technical and organizational measures to protect your personal data, 
                  including:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 text-lg">
                  <li>SSL/TLS encryption for data transmission</li>
                  <li>Secure authentication systems</li>
                  <li>Regular security assessments</li>
                  <li>Access controls and employee training</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Your Rights Card */}
          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl font-serif text-foreground">Your Rights</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 text-lg">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate information</li>
                  <li>Request deletion of your account and data</li>
                  <li>Object to processing of your data</li>
                  <li>Request data portability</li>
                  <li>Withdraw consent where processing is based on consent</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Data Retention Card */}
          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl font-serif text-foreground">Data Retention</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  We retain your personal data only as long as necessary to provide our services and comply 
                  with legal obligations. When you delete your account, we will remove your profile information 
                  within 30 days, except where we are required to retain certain data for legal purposes.
                </p>
              </div>
            </div>
          </div>

          {/* Children's Privacy Card */}
          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <UserX className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl font-serif text-foreground">Children's Privacy</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Jodohmu is strictly for users who are 18 years of age or older. We do not knowingly collect 
                  personal information from anyone under 18. If we become aware that we have collected information 
                  from a minor, we will take immediate steps to delete such information.
                </p>
              </div>
            </div>
          </div>

          {/* International Data Transfers Card */}
          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl font-serif text-foreground">International Data Transfers</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Your personal data may be transferred to and processed in countries other than Indonesia. 
                  We ensure appropriate safeguards are in place to protect your data in accordance with 
                  applicable data protection laws.
                </p>
              </div>
            </div>
          </div>

          {/* Changes to This Policy Card */}
          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Info className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl font-serif text-foreground">Changes to This Policy</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  We may update this privacy policy from time to time. We will notify you of any changes 
                  by posting the new policy on this page and updating the "Last updated" date.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Us Card */}
          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl font-serif text-foreground">Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  If you have any questions about this privacy policy or our data practices, please contact us:
                </p>
                <div className="bg-gradient-to-r from-[#9B2242]/5 to-[#0b3a86]/5 p-6 rounded-xl border border-border/50 space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary" />
                    <p className="text-foreground">
                      <strong>Email:</strong> <a href="mailto:info@jodohmu.com" className="text-primary hover:underline">info@jodohmu.com</a>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary" />
                    <p className="text-foreground">
                      <strong>Phone:</strong> <a href="tel:+6281327054561" className="text-primary hover:underline">+6281327054561</a>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-primary" />
                    <p className="text-foreground">
                      <strong>Location:</strong> Bandung, Indonesia
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
