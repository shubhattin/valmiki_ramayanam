// this file should be called root of project

import ExcelJS from "exceljs";
import LipiLekhikA from "./converter";

// Define file paths
const inputFilePath = "./files/input/Valmiki Ramayanam - Shloka Count.xlsx";
const outputFilePath =
  "./files/output/Valmiki Ramayanam - Shloka Count_converted.xlsx";

// Function to read, modify, and write an Excel file
async function processExcelFile() {
  // Create a new workbook instance
  const workbook = new ExcelJS.Workbook();

  try {
    // Read the Excel file
    await workbook.xlsx.readFile(inputFilePath);

    // Get the first worksheet
    const worksheet = workbook.getWorksheet(2)!;

    const lang_row = worksheet.getRow(1);
    const text_col = worksheet.getColumn(3);
    const texts: string[] = [];
    text_col.eachCell((cell, i) => {
      if (i > 1 && cell.value) texts.push(cell.value.toString());
    });
    await LipiLekhikA.k.load_lang("de");
    await LipiLekhikA.k.load_lang("hi");
    lang_row.eachCell(async (cell, col_i) => {
      const lang_name = cell.value?.toLocaleString().trim().replaceAll(" ", ""); // trimming white spaces and
      const lang_code = LipiLekhikA.k.normalize(lang_name);
      if (lang_code) {
        await LipiLekhikA.k.load_lang(lang_code);
        for (let i = 0; i < texts.length; i++) {
          const text = texts[i];
          const out = LipiLekhikA.parivartak(text, "de", lang_code);
          worksheet.getCell(i + 2, col_i).value = out;
          worksheet.getRow(i + 2).height = 30;
        }
      }
      await workbook.xlsx.writeFile(outputFilePath);
    });

    // // Make some changes
    // worksheet.getCell("A1").value = "Updated Value";
    // worksheet.getCell("B2").value = 12345;

    // // Add a new row
    // worksheet.addRow(["New Row", "Value"]);

    // Write the modified file to a new location
  } catch (err) {
    console.error("Error processing Excel file:", err);
  }
}

// Run the function
processExcelFile();
