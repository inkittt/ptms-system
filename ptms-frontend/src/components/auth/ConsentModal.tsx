'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ConsentModalProps {
  open: boolean;
  onAccept: (pdpaConsent: boolean, tosAccepted: boolean) => void;
  onCancel: () => void;
}

export function ConsentModal({ open, onAccept, onCancel }: ConsentModalProps) {
  const [pdpaConsent, setPdpaConsent] = useState(false);
  const [tosAccepted, setTosAccepted] = useState(false);

  const handleAccept = () => {
    if (pdpaConsent && tosAccepted) {
      onAccept(pdpaConsent, tosAccepted);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-3xl max-h-[90vh]" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Terms & Conditions</DialogTitle>
          <DialogDescription>
            Please review and accept the following terms to continue
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Personal Data Protection Act (PDPA) Notice</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  Universiti Teknologi MARA (UiTM) is committed to protecting your personal data in accordance with the Personal Data Protection Act 2010 (PDPA).
                </p>
                <p>
                  <strong>Data Collection:</strong> We collect personal information including your name, matric number, email address, phone number, and academic program details for the purpose of managing your practical training application and placement.
                </p>
                <p>
                  <strong>Data Usage:</strong> Your personal data will be used to:
                </p>
                <ul className="list-disc ml-6">
                  <li>Process your practical training applications</li>
                  <li>Communicate with you regarding your placement</li>
                  <li>Maintain academic records</li>
                  <li>Generate reports and statistics</li>
                  <li>Comply with legal and regulatory requirements</li>
                </ul>
                <p>
                  <strong>Data Sharing:</strong> Your information may be shared with:
                </p>
                <ul className="list-disc ml-6">
                  <li>Academic supervisors and coordinators</li>
                  <li>Host organizations for placement purposes</li>
                  <li>Relevant UiTM departments</li>
                </ul>
                <p>
                  <strong>Data Security:</strong> We implement appropriate security measures to protect your personal data from unauthorized access, disclosure, or misuse.
                </p>
                <p>
                  <strong>Your Rights:</strong> You have the right to access, correct, or request deletion of your personal data. Contact the system administrator for such requests.
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-lg mb-2">Terms of Service</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  By using the Practical Training Management System (PTMS), you agree to the following terms:
                </p>
                <p>
                  <strong>1. Account Responsibility:</strong> You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.
                </p>
                <p>
                  <strong>2. Accurate Information:</strong> You agree to provide accurate, current, and complete information during registration and application processes.
                </p>
                <p>
                  <strong>3. Acceptable Use:</strong> You agree to use the system only for its intended purpose of managing practical training applications and related activities.
                </p>
                <p>
                  <strong>4. Prohibited Activities:</strong> You must not:
                </p>
                <ul className="list-disc ml-6">
                  <li>Share your account credentials with others</li>
                  <li>Attempt to gain unauthorized access to the system</li>
                  <li>Submit false or misleading information</li>
                  <li>Interfere with the system's operation</li>
                </ul>
                <p>
                  <strong>5. System Availability:</strong> While we strive for continuous availability, the system may be temporarily unavailable for maintenance or updates.
                </p>
                <p>
                  <strong>6. Changes to Terms:</strong> UiTM reserves the right to modify these terms at any time. Continued use of the system constitutes acceptance of modified terms.
                </p>
                <p>
                  <strong>7. Termination:</strong> UiTM may suspend or terminate your access if you violate these terms or engage in prohibited activities.
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="pdpa"
              checked={pdpaConsent}
              onCheckedChange={(checked) => setPdpaConsent(checked as boolean)}
            />
            <Label htmlFor="pdpa" className="text-sm cursor-pointer">
              I have read and agree to the Personal Data Protection Act (PDPA) notice
            </Label>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="tos"
              checked={tosAccepted}
              onCheckedChange={(checked) => setTosAccepted(checked as boolean)}
            />
            <Label htmlFor="tos" className="text-sm cursor-pointer">
              I have read and agree to the Terms of Service
            </Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleAccept}
              disabled={!pdpaConsent || !tosAccepted}
            >
              Accept & Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
