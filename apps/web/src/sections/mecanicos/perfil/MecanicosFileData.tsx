import RenderFilePreview from "@/components/RenderFilePreview";

interface MecanicosFileDataProps {
  filePath: string | null;
  alt?: string;
  maxWidth?: number;
  maxHeight?: number;
}

function MecanicosFileData({
  filePath,
  alt = "Archivo",
  maxWidth = 300,
  maxHeight = 300,
}: MecanicosFileDataProps) {
  return (
    <RenderFilePreview
      filePath={filePath}
      alt={alt}
      maxWidth={maxWidth}
      maxHeight={maxHeight}
      emptyLabel="Sin archivo"
    />
  );
}

export default MecanicosFileData;
