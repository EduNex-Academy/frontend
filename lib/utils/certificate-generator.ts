// Dynamic imports for better code splitting
type JsPDF = typeof import('jspdf').default;
type Html2Canvas = typeof import('html2canvas').default;

export interface CertificateData {
  studentName: string;
  courseName: string;
  instructorName: string;
  completionDate: string;
  courseCategory: string;
  totalModules: number;
}

export class CertificateGenerator {
  /**
   * Generate a certificate PDF from certificate data
   */
  static async generateCertificatePDF(certificateData: CertificateData): Promise<Blob> {
    // Dynamic imports for better code splitting
    const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
      import('jspdf'),
      import('html2canvas')
    ]);

    const certificateHtml = this.createCertificateHTML(certificateData);
    
    // Create a temporary container
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.width = '1200px';
    container.style.height = '800px';
    container.innerHTML = certificateHtml;
    
    document.body.appendChild(container);
    
    try {
      // Convert to canvas
      const canvas = await html2canvas(container, {
        width: 1200,
        height: 800,
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff'
      });
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1200, 800]
      });
      
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, 1200, 800);
      
      return pdf.output('blob');
    } finally {
      document.body.removeChild(container);
    }
  }

  /**
   * Download certificate as PDF
   */
  static async downloadCertificate(certificateData: CertificateData): Promise<void> {
    const blob = await this.generateCertificatePDF(certificateData);
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${certificateData.studentName.replace(/[^a-z0-9]/gi, '_')}_${certificateData.courseName.replace(/[^a-z0-9]/gi, '_')}_Certificate.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  /**
   * Create the HTML structure for the certificate with improved alignment
   */
  private static createCertificateHTML(data: CertificateData): string {
    const formattedDate = new Date(data.completionDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
      <div style="
        width: 1200px;
        height: 800px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        position: relative;
        font-family: 'Georgia', serif;
        color: #2c3e50;
        overflow: hidden;
        box-sizing: border-box;
      ">
        <!-- Background Pattern -->
        <div style="
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: 
            radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%);
          background-size: 200px 200px;
        "></div>

        <!-- Certificate Content Container -->
        <div style="
          position: relative;
          z-index: 1;
          background: white;
          margin: 40px;
          height: calc(100% - 80px);
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          padding: 60px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
        ">
          <!-- Header -->
          <div style="margin-bottom: 30px;">
            <h1 style="
              font-size: 48px;
              font-weight: bold;
              color: #2c3e50;
              margin: 0 0 8px 0;
              letter-spacing: 2px;
              text-transform: uppercase;
            ">Certificate</h1>
            <h2 style="
              font-size: 28px;
              font-weight: normal;
              color: #7f8c8d;
              margin: 0;
              font-style: italic;
            ">of Completion</h2>
          </div>

          <!-- Decorative Line -->
          <div style="
            width: 200px;
            height: 3px;
            background: linear-gradient(90deg, #667eea, #764ba2);
            margin-bottom: 35px;
            border-radius: 2px;
          "></div>

          <!-- Main Content -->
          <div style="margin-bottom: 35px;">
            <p style="
              font-size: 24px;
              color: #34495e;
              margin: 0 0 18px 0;
              font-weight: 300;
            ">This certifies that</p>
            
            <h3 style="
              font-size: 42px;
              font-weight: bold;
              color: #2c3e50;
              margin: 0 0 25px 0;
              font-family: 'Georgia', serif;
              border-bottom: 2px solid #ecf0f1;
              padding-bottom: 10px;
              display: inline-block;
              min-width: 400px;
            ">${data.studentName}</h3>
            
            <p style="
              font-size: 24px;
              color: #34495e;
              margin: 0 0 10px 0;
              font-weight: 300;
            ">has successfully completed the course</p>
            
            <h4 style="
              font-size: 36px;
              font-weight: bold;
              color: #667eea;
              margin: 10px 0 18px 0;
              font-family: 'Georgia', serif;
            ">"${data.courseName}"</h4>
            
            <p style="
              font-size: 20px;
              color: #7f8c8d;
              margin: 0;
              font-style: italic;
            ">in ${data.courseCategory}</p>
          </div>

          <!-- Course Details -->
          <div style="
            display: flex;
            justify-content: space-between;
            width: 100%;
            max-width: 600px;
            margin-bottom: 35px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
          ">
            <div style="text-align: left;">
              <p style="
                font-size: 16px;
                color: #6c757d;
                margin: 0 0 5px 0;
                font-weight: bold;
              ">Completion Date:</p>
              <p style="
                font-size: 18px;
                color: #2c3e50;
                margin: 0;
              ">${formattedDate}</p>
            </div>
            <div style="text-align: center;">
              <p style="
                font-size: 16px;
                color: #6c757d;
                margin: 0 0 5px 0;
                font-weight: bold;
              ">Total Modules:</p>
              <p style="
                font-size: 18px;
                color: #2c3e50;
                margin: 0;
              ">${data.totalModules}</p>
            </div>
            <div style="text-align: right;">
              <p style="
                font-size: 16px;
                color: #6c757d;
                margin: 0 0 5px 0;
                font-weight: bold;
              ">Instructor:</p>
              <p style="
                font-size: 18px;
                color: #2c3e50;
                margin: 0;
              ">${data.instructorName}</p>
            </div>
          </div>

          <!-- Footer -->
          <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            margin-top: auto;
          ">
            <!-- EduNex Logo/Brand -->
            <div>
              <h5 style="
                font-size: 24px;
                font-weight: bold;
                color: #667eea;
                margin: 0;
                font-family: 'Georgia', serif;
              ">EduNex Academy</h5>
              <p style="
                font-size: 14px;
                color: #95a5a6;
                margin: 5px 0 0 0;
              ">Excellence in Online Education</p>
            </div>
            
            <!-- Verification Badge -->
            <div style="
              width: 120px;
              height: 120px;
              border-radius: 50%;
              background: linear-gradient(135deg, #667eea, #764ba2);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 11px;
              text-align: center;
              line-height: 1.3;
              padding: 10px;
              box-sizing: border-box;
            ">
              <div>
                <div style="font-size: 24px; margin-bottom: 8px;">✓</div>
                <div style="font-size: 10px; letter-spacing: 0.5px;">VERIFIED</div>
                <div style="font-size: 10px; letter-spacing: 0.5px;">COMPLETION</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Decorative Corner Elements -->
        <div style="
          position: absolute;
          top: 20px;
          left: 20px;
          width: 80px;
          height: 80px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
        "></div>
        
        <div style="
          position: absolute;
          bottom: 20px;
          right: 20px;
          width: 60px;
          height: 60px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
        "></div>
      </div>
    `;
  }
}