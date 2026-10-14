
const API_URL =
  "https://script.google.com/macros/s/AKfycbxUgaJGstTiqyKIfDQzgv5zgR0OVROWCQUMdwv2pMMp-rMq1VP_4vkJDtltQtSr1poR/exec";

async function fetchRecords() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("API request failed");
  }

  const result = await response.json();

  if (Array.isArray(result)) {
    return result;
  }

  if (Array.isArray(result.data)) {
    return result.data;
  }

  return [result];
}

// Get the first matching record
export async function getApiData(id = 1) {
  const records = await fetchRecords();

  const record = records.find(
    (item) =>
      String(item?.Id ?? "").trim() === String(id).trim()
  );

  if (!record) {
    throw new Error(`API record with Id ${id} not found`);
  }

  return record;
}

// Get all matching records with valid image/file links
export async function getApiDataArray(id = 1) {
  const records = await fetchRecords();

  return records.filter(
    (item) =>
      String(item?.Id ?? "").trim() === String(id).trim() &&
      /^https?:\/\//i.test(String(item?.link ?? "").trim())
  );
}

// Get every record from the API
export async function getAllApiData() {
  return await fetchRecords();
}
