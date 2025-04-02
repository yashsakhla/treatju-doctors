import { Injectable } from '@angular/core';

import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor() { }
  print(role:any,data: any) {
    const doc = new jsPDF();

    // Add Background Logo
    const logoImg = new Image();
    logoImg.src = 'assets/images/logo.png'; // Provide the path to your logo image
    
    logoImg.onload = () => {
      const logoWidth = 30; // Adjust width of the logo
      const logoHeight = 30; // Adjust height of the logo
      const logoX = 170; // X position of the logo
      const logoY = 10; // Y position of the logo
    
      // Adding logo to the header left side
      doc.addImage(logoImg, 'PNG', logoX, logoY, logoWidth, logoHeight);
    
      // Header Section
      const headerTitle = role.username;
      doc.setFontSize(22);
      doc.setFont("times", "bold");
      doc.text(headerTitle, 10, 20);
    
      // Address Text on Header Left
      doc.setFontSize(10);
      doc.setFont("times", "normal");
      doc.text(`Address:-${role.address},${role.city}, \nContact: +91-+${role.mobile}`, 10, 30);
    
      // Header Lines
      doc.setDrawColor(0, 0, 0); // Black color
      doc.line(10, 40, 200, 40); // Horizontal line below the header
    
      // Content Styling
      doc.setFontSize(12);
      doc.setFont("times", "normal");
    
      // Left Column
      let yPosition = 40;
      doc.text(`Name - ${data.username}`, 10, (yPosition += 10));
      doc.text(`Mobile - ${data.mobile}`, 10, (yPosition += 10));
      doc.text(`Age - ${data.age}`, 10, (yPosition += 10));
      doc.text(`Gender - ${data.gender}`, 10, (yPosition += 10));
    
      // Right Column
      yPosition = 50;
      const rightColumnX = 120;
      doc.text(`Date - ${new Date().toLocaleDateString()}`, rightColumnX, yPosition);
      doc.text(`Booked By -`, rightColumnX, (yPosition += 10));
      doc.text(`Tritju.com`, rightColumnX, (yPosition += 10));
    
      // Prescription Section (Below Content)
      yPosition += 20;
      doc.text(`Rx`, 10, yPosition);
    
      // Automatically Trigger PDF Download
      doc.save("Patient_Receipt.pdf");
    };
  }    
  

}
