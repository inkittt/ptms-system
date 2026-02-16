'use client';

import { GraduationCap, Heart, Award } from 'lucide-react';

export default function AcknowledgmentPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="h-10 w-10" />
              <h1 className="text-3xl font-bold">Acknowledgment</h1>
            </div>
            <p className="text-blue-50 text-lg">
              Recognizing those who made this system possible
            </p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            {/* Developer Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Award className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-semibold text-gray-900">System Developer</h2>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
                <p className="text-lg font-bold text-gray-900 mb-2">
                  MOHAMAD AFIQ HAIKAL BIN ZAIHAN
                </p>
                <div className="space-y-1 text-gray-700">
                  <p><span className="font-semibold">Matric Number:</span> 2022484226</p>
                  <p><span className="font-semibold">Faculty:</span> FSKM</p>
                  <p><span className="font-semibold">Program:</span> CS251 NETSENTRIK</p>
                  <p><span className="font-semibold">Campus:</span> UiTM Kampus Jasin, Melaka</p>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">About This System</h3>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>
                  The Practical Training Management System (PTMS) was developed as part of an academic project 
                  to streamline and modernize the management of student practical training programs. This comprehensive 
                  platform aims to facilitate seamless coordination between students, supervisors, and administrators 
                  throughout the entire training lifecycle.
                </p>
                <p>
                  PTMS addresses the challenges faced in traditional paper-based training management by providing 
                  a centralized digital platform that automates workflow processes, enhances communication, and 
                  ensures real-time tracking of student progress. The system integrates multiple functionalities 
                  including logbook management, document submission and review, supervisor coordination, and 
                  comprehensive reporting capabilities.
                </p>
                <p>
                  Built with modern web technologies including Next.js, React, and Node.js, PTMS offers a responsive 
                  and intuitive user interface that works seamlessly across desktop and mobile devices. The system 
                  implements robust security measures to protect sensitive student data and ensures compliance with 
                  data protection regulations.
                </p>
                <p>
                  Key features include automated BLI (Borang Latihan Industri) form generation, digital signature 
                  integration, real-time notifications, session management, and detailed analytics dashboards. 
                  The platform supports multiple user roles including students, coordinators, and supervisors, 
                  each with tailored interfaces and functionalities specific to their needs.
                </p>
              </div>
            </div>

            {/* Gratitude Section */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Special Thanks</h3>
              <p className="text-gray-700 leading-relaxed">
                Special appreciation to all supervisors, coordinators, and students who provided valuable 
                feedback during the development process. Your insights have been instrumental in shaping 
                this system to better serve the academic community.
              </p>
            </div>

            {/* Footer */}
            <div className="pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 text-gray-600">
                <GraduationCap className="h-5 w-5" />
                <p className="text-sm">
                  © {new Date().getFullYear()} PTMS - Practical Training Management System
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
