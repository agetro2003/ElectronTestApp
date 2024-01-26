function encryptFile() {
const p1 = document.getElementById('p1');
  const fileInput = document.getElementById('fileInput');
  const filePath = fileInput.files[0].path;
  window.electronAPI.encryptFile(filePath);
    p1.innerHTML = 'Archivo descargado en el escritorio';
}
