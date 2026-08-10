const CLOUD_NAME='lxvtjllj';
const UPLOAD_PRESET='miluzza_produtos';
const MAX_SIZE=5*1024*1024;
const TYPES=['image/jpeg','image/png','image/webp'];
export async function uploadImage(file){
  if(!file) throw new Error('Selecione uma imagem.');
  if(!TYPES.includes(file.type)) throw new Error('A imagem deve ser JPG, PNG ou WEBP.');
  if(file.size>MAX_SIZE) throw new Error('A imagem deve ter no máximo 5 MB.');
  const form=new FormData(); form.append('file',file); form.append('upload_preset',UPLOAD_PRESET); form.append('folder','miluzza/produtos');
  const response=await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,{method:'POST',body:form});
  const data=await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(data?.error?.message||'Não foi possível enviar a imagem.');
  if(!data.secure_url) throw new Error('O Cloudinary não retornou a URL da imagem.');
  return data.secure_url;
}
