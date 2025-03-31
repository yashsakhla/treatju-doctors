import { Injectable } from '@angular/core';

import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor() { }
  print(data: any) {
    const doc = new jsPDF();
  
    // Header Section
    const headerTitle = "Sharma Hospital";
    doc.setFontSize(22);
    doc.setFont("times", "bold");
    doc.text(headerTitle, 10, 20);
  
    // Header Lines
    doc.setDrawColor(0, 0, 0); // Black color
    doc.line(10, 25, 200, 25); // Horizontal line below the header
  
    // Content Styling
    doc.setFontSize(12);
    doc.setFont("times", "normal");
  
    // Left Column
    let yPosition = 35;
    doc.text(`Patient ID - ${data._id}`, 10, yPosition);
    doc.text(`Name - ${data.username}`, 10, (yPosition += 10));
    doc.text(`Mobile - ${data.mobile}`, 10, (yPosition += 10));
    doc.text(`Age - ${data.age}`, 10, (yPosition += 10));
    doc.text(`Gender - ${data.gender}`, 10, (yPosition += 10));
  
    // Right Column
    yPosition = 35;
    const rightColumnX = 120;
    doc.text(`Date - ${new Date().toLocaleDateString()}`, rightColumnX, yPosition);
    doc.text(`Booked By -`, rightColumnX, (yPosition += 10));
    doc.text(`Tritju.com`, rightColumnX, (yPosition += 10));
  
    // Prescription Section (Below Content)
    yPosition += 20;
    doc.text(`Rx`, 10, yPosition);
  
    // Automatically Trigger PDF Download
    doc.save("Patient_Receipt.pdf");
  }
  

}
