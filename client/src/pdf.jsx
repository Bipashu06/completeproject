import React, { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const PDFGenerator = ({
  children,
  fileName = "example.pdf",
  resetFields = () => {}, // Optional callback to reset fields after PDF generation
}) => {
  const pdfRef = useRef();

  const generatePDF = () => {
    const input = pdfRef.current;
    html2canvas(input, { scale: 2 })
      .then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(fileName);
      })
      .catch((error) => console.error("Error generating PDF:", error))
      .finally(() => resetFields());
  };

  return (
    <div>
      {/* Wrap content in a div with the ref */}
      <div ref={pdfRef}>{children}</div>
      {/* Add a button or allow parent to control it */}
      <button onClick={generatePDF}>Generate PDF</button>
    </div>
  );
};

export default PDFGenerator;
