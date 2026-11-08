
import jsPDF from "jspdf";
import logo from "../assets/image/logo512.png";

// Load logo as Data URL
const loadLogoData = async () => {
  const response = await fetch(logo);

  if (!response.ok) {
    throw new Error("Unable to load Golden Dreams logo.");
  }

  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () =>
      reject(new Error("Unable to read Golden Dreams logo."));

    reader.readAsDataURL(blob);
  });
};

// Format customized package description
const getProductDetails = (item, pdf) => {
  if (!item.customizable || !item.description) {
    return [];
  }

  return item.description
    .split(" | ")
    .filter(Boolean)
    .map((detail) => pdf.splitTextToSize(detail, 75))
    .flat();
};

export const generateStoreQuotation = async ({
  customer,
  cartItems,
  cartTotal,
}) => {
  const logoData = await loadLogoData();

  const pdf = new jsPDF();

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 18;

  const quotationNumber = `GD-${Date.now().toString().slice(-8)}`;
  const quotationDate = new Date().toLocaleDateString("en-IN");

  const gold = [190, 151, 65];
  const black = [20, 20, 20];
  const grey = [100, 100, 100];

  // Header background
  pdf.setFillColor(...black);
  pdf.rect(0, 0, pageWidth, 48, "F");

  // Golden Dreams logo
  pdf.addImage(logoData, "PNG", margin, 10, 22, 22);

  // Brand name
  pdf.setTextColor(...gold);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(21);
  pdf.text("GOLDEN DREAMS", margin + 27, 23);

  // Tagline
  pdf.setFontSize(8);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "normal");
  pdf.text(
    "PHOTOGRAPHY & CREATIVE GIFTS",
    margin + 27,
    30
  );

  // Business address
  pdf.setFontSize(6.5);
  pdf.setTextColor(230, 230, 230);

  pdf.text(
    "Satankulam Main Road, Near Thirumaraiyur Bus Stop,",
    margin + 27,
    37
  );

  pdf.text(
    "Nazareth, Thoothukudi - 628617",
    margin + 27,
    42
  );

  // Quotation details
  pdf.setTextColor(...gold);
  pdf.setFontSize(17);
  pdf.setFont("helvetica", "bold");

  pdf.text("QUOTATION", pageWidth - margin, 22, {
    align: "right",
  });

  pdf.setFontSize(9);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "normal");

  pdf.text(`No: ${quotationNumber}`, pageWidth - margin, 31, {
    align: "right",
  });

  pdf.text(`Date: ${quotationDate}`, pageWidth - margin, 37, {
    align: "right",
  });

  // Customer details
  let y = 62;

  pdf.setTextColor(...gold);
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");

  pdf.text("CUSTOMER DETAILS", margin, y);

  y += 10;

  pdf.setTextColor(...black);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");

  pdf.text(`Name: ${customer.name || "-"}`, margin, y);
  y += 7;

  pdf.text(`Contact: ${customer.phone || "-"}`, margin, y);
  y += 7;

  const addressLines = pdf.splitTextToSize(
    `Address: ${customer.address || "-"}`,
    pageWidth - margin * 2
  );

  pdf.text(addressLines, margin, y);
  y += addressLines.length * 6 + 8;

  if (customer.eventDate) {
    pdf.text(`Event Date: ${customer.eventDate}`, margin, y);
    y += 8;
  }

  // Product table heading
  const drawTableHeader = () => {
    pdf.setFillColor(...black);
    pdf.rect(margin, y, pageWidth - margin * 2, 10, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);

    pdf.text("PRODUCT", margin + 3, y + 7);

    pdf.text("QTY", 117, y + 7, {
      align: "center",
    });

    pdf.text("PRICE", 145, y + 7, {
      align: "right",
    });

    pdf.text("AMOUNT", pageWidth - margin - 3, y + 7, {
      align: "right",
    });

    y += 17;
  };

  drawTableHeader();

  // Product rows
  cartItems.forEach((item) => {
    const productName = pdf.splitTextToSize(item.name, 75);

    // Customized package details
    const details = getProductDetails(item, pdf);

    const nameHeight = productName.length * 5;
    const detailsHeight = details.length * 4.5;

    const rowHeight = Math.max(
      nameHeight + detailsHeight + (details.length ? 5 : 0),
      9
    );

    // Add a new page if required
    if (y + rowHeight + 10 > pageHeight - 35) {
      pdf.addPage();
      y = 25;
      drawTableHeader();
    }

    // Save product row starting position
    const rowStartY = y;

    // Product name
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(...black);

    pdf.text(productName, margin + 3, rowStartY);

    // Customized product details
    if (details.length > 0) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);
      pdf.setTextColor(...grey);

      pdf.text(
        details,
        margin + 3,
        rowStartY + nameHeight + 2
      );
    }

    // Quantity
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(...black);

    pdf.text(String(item.quantity), 117, rowStartY, {
      align: "center",
    });

    // Unit price
    pdf.text(
      `Rs. ${Number(item.price).toLocaleString("en-IN")}`,
      145,
      rowStartY,
      { align: "right" }
    );

    // Amount
    const amount = item.price * item.quantity;

    pdf.text(
      `Rs. ${amount.toLocaleString("en-IN")}`,
      pageWidth - margin - 3,
      rowStartY,
      { align: "right" }
    );

    // Divider line below the complete product row
    const dividerY = rowStartY + rowHeight + 1;

    pdf.setDrawColor(225, 225, 225);
    pdf.setLineWidth(0.2);

    pdf.line(
      margin,
      dividerY,
      pageWidth - margin,
      dividerY
    );

    // Space before next product
    y = dividerY + 7;
  });

  // Grand total
  y += 8;

  if (y > pageHeight - 35) {
    pdf.addPage();
    y = 25;
  }

  pdf.setFillColor(248, 244, 235);
  pdf.rect(pageWidth - 82, y, 64, 15, "F");

  pdf.setTextColor(...black);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);

  pdf.text("GRAND TOTAL", pageWidth - 78, y + 9);

  pdf.setTextColor(...gold);

  pdf.text(
    `Rs. ${cartTotal.toLocaleString("en-IN")}`,
    pageWidth - margin - 3,
    y + 9,
    { align: "right" }
  );

  // Footer
  const footerY = pageHeight - 20;

  pdf.setDrawColor(...gold);
  pdf.line(
    margin,
    footerY - 7,
    pageWidth - margin,
    footerY - 7
  );

  pdf.setTextColor(...grey);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);

  pdf.text(
    "Thank you for choosing Golden Dreams!",
    pageWidth / 2,
    footerY,
    { align: "center" }
  );

  pdf.text(
    "This is a quotation and not a payment receipt.",
    pageWidth / 2,
    footerY + 5,
    { align: "center" }
  );

  // Download PDF
  pdf.save(`Golden-Dreams-${quotationNumber}.pdf`);

  return quotationNumber;
};
