async function parseMultipartRequest(request: Request) {
  const formData = await request.formData();
  const body = JSON.parse(formData.get("data") as string);
  const pdf = formData.get("pdfPath") as File | null;

  return { body, pdf };
}
