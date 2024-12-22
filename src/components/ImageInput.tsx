import Image from "next/image";

type Props = {
  image: string | null;
  setImage: (image: string | null) => void;
};

function ImageInput({ image, setImage }: Props) {
  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload-tmp-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error al subir la imagen");
      }

      const data = await response.json();
      setImage(data.url);
    } catch (error) {
      console.error("Error al subir imagen:", error);
    }
  };

  return (
    <div>
      {image && (
        <Image
          src={image}
          alt="Imagen seleccionada"
          width={300}
          height={200}
          style={{ width: "300px", height: "auto" }}
        />
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        style={{ display: "block" }}
      />
    </div>
  );
}

export default ImageInput;
