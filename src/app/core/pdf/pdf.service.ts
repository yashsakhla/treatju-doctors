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
    console.log("caleed")
    // Tritju Junction Header
    const title = "Tritju Junction";

    // Set Header Text
    doc.setFontSize(20);
    doc.text(title, 80, 20); // Center-aligned

    // Patient Details
    doc.setFontSize(12);
    let yPosition = 40;
    doc.text(`Patient ID: ${data._id}`, 10, yPosition);
    doc.text(`Name: ${data.username}`, 10, (yPosition += 10));
    doc.text(`Mobile: ${data.mobile}`, 10, (yPosition += 10));
    doc.text(`Email: ${data.email}`, 10, (yPosition += 10));
    doc.text(`Age: ${data.age}`, 10, (yPosition += 10));
    doc.text(`Gender: ${data.gender}`, 10, (yPosition += 10));
    doc.text(`Role: ${data.role}`, 10, (yPosition += 10));

    // Booking Details
    yPosition += 10;
    doc.text("Booked Events:", 10, yPosition);
    data.bookEvents.forEach((event: any, index: number) => {
      yPosition += 10;
      doc.text(`${index + 1}. ${event.serviceName} - ${new Date(event.bookingDate).toDateString()}`, 10, yPosition);
    });

    // Automatically Trigger PDF Download
    doc.save("Patient_Receipt.pdf");
  }

}
