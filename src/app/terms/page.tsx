import { Metadata } from "next";
import { FileText, UserCheck, Shield, AlertTriangle, X, CreditCard, MapPin, Phone, Mail, Info, Link as LinkIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms and Conditions - Jodohmu",
  description: "Terms and conditions for Jodohmu - Find your soulmate with care, faith, and sincerity.",
};

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#9B2242] via-[#9B2242]/80 to-[#0b3a86]/90 opacity-95"></div>
        <div className="relative bg-gradient-to-br from-[#9B2242]/10 via-transparent to-[#0b3a86]/5">
          <div className="container py-16">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm ring-2 ring-white/20">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-4">
                <h1 className="text-5xl font-serif text-white drop-shadow-lg">Terms and Conditions</h1>
                <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                  Please read these terms carefully before using Jodohmu. By using our service, you agree to these terms.
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
          {/* Acceptance of Terms Card */}
          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-serif text-foreground">Acceptance of Terms</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  By accessing and using Jodohmu, you accept and agree to be bound by the terms and provision of this agreement. 
                  If you do not agree to abide by the above, please do not use this service.
                </p>
              </div>
            </div>
          </div>

          {/* Eligibility Card */}
          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl font-serif text-foreground">Eligibility</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  You must be at least 18 years of age to create an account and use Jodohmu. By using our service, 
                  you represent and warrant that you are at least 18 years of age and have the legal capacity to enter 
                  into these terms.
                </p>
                <div className="bg-destructive/5 p-4 rounded-lg border border-destructive/20">
                  <p className="text-foreground font-semibold">Important:</p>
                  <p className="text-muted-foreground">
                    Misrepresenting your age is a violation of these terms and may result in immediate account termination 
                    and potential legal consequences.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Registration Card */}
          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl font-serif text-foreground">Account Registration & Security</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Registration Requirements</h3>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      You must provide accurate, current, and complete information during registration. You are responsible 
                      for maintaining the confidentiality of your account credentials.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Account Security</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2 text-lg">
                      <li>You are solely responsible for all activities under your account</li>
                      <li>Notify us immediately of any unauthorized use</li>
                      <li>We are not liable for any loss or damage from unauthorized access</li>
                      <li>You may not share your account credentials with others</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Conduct Card */}
          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl font-serif text-foreground">User Conduct & Prohibited Activities</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  You agree not to engage in any of the following prohibited activities:
                </p>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Content Prohibitions</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2 text-lg">
                      <li>Posting false, misleading, or deceptive information</li>
                      <li>Uploading inappropriate, offensive, or illegal content</li>
                      <li>Using fake photos or misrepresenting your appearance</li>
                      <li>Sharing explicit or sexually suggestive content</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Behavioral Prohibitions</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2 text-lg">
                      <li>Harassment, bullying, or threatening other users</li>
                      <li>Spamming or sending unsolicited commercial messages</li>
                      <li>Attempting to obtain personal information from others</li>
                      <li>Using the service for illegal activities</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Guidelines Card */}
          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl font-serif text-foreground">Content Guidelines</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Profile Content</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2 text-lg">
                      <li>All photos must be of you and current (within 1 year)</li>
                      <li>Bio information must be truthful and accurate</li>
                      <li>No contact information in public profiles</li>
                      <li>No watermarks or promotional content</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Content Removal</h3>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      We reserve the right to remove any content that violates these guidelines without notice. 
                      Repeated violations may result in account suspension or termination.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Intellectual Property Card */}
          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl font-serif text-foreground">Intellectual Property</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Your Content</h3>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      You retain ownership of content you post on Jodohmu. By posting content, you grant us a 
                      non-exclusive, worldwide, royalty-free license to use, display, and distribute your content 
                      for the purpose of operating and promoting our service.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Platform Content</h3>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      All Jodohmu platform content, including logos, designs, and proprietary technology, is 
                      protected by intellectual property laws and may not be used without our permission.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Disclaimers Card */}
          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl font-serif text-foreground">Disclaimers & Limitations of Liability</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">No Guarantees</h3>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      Jodohmu does not guarantee that you will find a match, relationship, or compatible partner. 
                      The matching process is based on algorithms and preferences that may not yield desired results.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Meeting Safety</h3>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      You are solely responsible for your safety when meeting other users in person. We recommend 
                      meeting in public places and informing friends or family of your plans. We are not liable for 
                      any harm resulting from in-person meetings.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Limitation of Liability</h3>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      To the fullest extent permitted by law, Jodohmu shall not be liable for any indirect, 
                      incidental, special, or consequential damages arising from your use of our service.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Termination Card */}
          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <X className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl font-serif text-foreground">Account Termination</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Voluntary Termination</h3>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      You may terminate your account at any time through your account settings. Upon termination, 
                      your profile will be removed within 30 days as outlined in our Privacy Policy.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Termination by Jodohmu</h3>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      We reserve the right to suspend or terminate your account immediately for violations of these 
                      terms, illegal activities, or behavior that harms other users or our platform.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Changes to Terms Card */}
          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Info className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl font-serif text-foreground">Changes to Terms</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  We reserve the right to modify these terms and conditions at any time. When we make changes, 
                  we will post the updated terms on this page and update the "Last updated" date at the top of this page.
                </p>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  For significant changes, we will notify users via email or through in-app notifications. 
                  Your continued use of Jodohmu after any changes constitutes acceptance of the new terms.
                </p>
              </div>
            </div>
          </div>

          {/* Privacy Reference Card */}
          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <LinkIcon className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl font-serif text-foreground">Privacy Policy</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Your use of Jodohmu is also governed by our Privacy Policy, which explains how we collect, 
                  use, and protect your personal information. Please review our Privacy Policy at 
                  <a href="/privacy" className="text-primary hover:underline"> /privacy</a>.
                </p>
              </div>
            </div>
          </div>

          {/* Governing Law Card */}
          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl font-serif text-foreground">Governing Law & Dispute Resolution</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Governing Law</h3>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      These terms and conditions are governed by and construed in accordance with the laws of 
                      Indonesia, without regard to its conflict of law provisions.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Dispute Resolution</h3>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      Any disputes arising from these terms or your use of Jodohmu shall be resolved through 
                      good faith negotiations. If unresolved, disputes shall be submitted to arbitration in 
                      Bandung, Indonesia, in accordance with Indonesian arbitration laws.
                    </p>
                  </div>
                </div>
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
                  If you have any questions about these terms and conditions, please contact us:
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
