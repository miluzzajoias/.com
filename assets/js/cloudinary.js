const CLOUD_NAME = "lxvtjllj";

const UPLOAD_PRESET = "miluzza_produtos";


// ============================================================
// UPLOAD PARA O CLOUDINARY
// ============================================================

export async function uploadImage(file) {

  if (!file) {
    throw new Error(
      "Nenhuma imagem foi selecionada."
    );
  }


  if (!file.type.startsWith("image/")) {
    throw new Error(
      "O arquivo selecionado não é uma imagem."
    );
  }


  const formData = new FormData();

  formData.append(
    "file",
    file
  );

  formData.append(
    "upload_preset",
    UPLOAD_PRESET
  );


  const endpoint =
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;


  console.log(
    "Enviando imagem para Cloudinary..."
  );

  console.log(
    "Cloud Name:",
    CLOUD_NAME
  );

  console.log(
    "Upload Preset:",
    UPLOAD_PRESET
  );


  try {

    const response =
      await fetch(
        endpoint,
        {
          method: "POST",
          body: formData
        }
      );


    const data =
      await response.json();


    console.log(
      "Resposta do Cloudinary:",
      data
    );


    if (!response.ok) {

      throw new Error(
        data?.error?.message ||
        `Cloudinary retornou erro ${response.status}.`
      );

    }


    if (!data.secure_url) {

      throw new Error(
        "O Cloudinary recebeu a imagem, mas não retornou uma URL."
      );

    }


    console.log(
      "Imagem enviada com sucesso:"
    );

    console.log(
      data.secure_url
    );


    return data.secure_url;


  } catch (error) {

    console.error(
      "ERRO NO CLOUDINARY:",
      error
    );


    throw new Error(
      error.message ||
      "Não foi possível enviar a imagem para o Cloudinary."
    );

  }

}