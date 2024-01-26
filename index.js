const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const xlsx = require('xlsx');
let mainWindow;

// Función para encriptar un archivo Excel
function encryptExcel(inputPath, outputPath, publicKey) {
    // Leer el archivo Excel
    const workbook = xlsx.readFile(inputPath);
  
    // Convertir el contenido a cadena
    const excelData = JSON.stringify(workbook);
  
    // Encriptar con la clave pública
    const encryptedData = encryptLargeData(excelData, publicKey);
  
    // Escribir el archivo encriptado
    fs.writeFileSync(outputPath, encryptedData);
  }

// Función para encriptar datos grandes
function encryptLargeData(data, publicKey) {
    const chunkSize = 128; // Tamaño del bloque, ajusta según tus necesidades
  
    // Divide los datos en bloques más pequeños
    const chunks = [];
    for (let i = 0; i < data.length; i += chunkSize) {
      chunks.push(data.slice(i, i + chunkSize));
    }
  
    // Encriptar cada bloque
    const encryptedChunks = chunks.map(chunk =>
      crypto.publicEncrypt(
        {
          key: publicKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256',
        },
        Buffer.from(chunk)
      )
    );
  
    // Concatenar los bloques encriptados
    const encryptedData = Buffer.concat(encryptedChunks);
  
    return encryptedData;
  }

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile('index.html');

  const mainMenu = Menu.buildFromTemplate(templateMenu);
  Menu.setApplicationMenu(mainMenu);

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});

// Agrega la funcionalidad para cifrar y enviar el archivo al servidor
const publicKey = fs.readFileSync(path.join(__dirname, 'public.pem'));

app.on('ready', () => {
  const { ipcMain } = require('electron');

  ipcMain.on('encrypt-file', async (event, filePath) => {
    console.log('Encrypting file:', filePath)
    try {
      // direccion del escritorio
      const desktopPath = app.getPath('desktop');
      console.log('Desktop path:', desktopPath);
        const encryptedFile = path.join(desktopPath, 'encrypted.xlsx');
        encryptExcel(filePath, encryptedFile, publicKey);
    } catch (error) {
      console.error('Error during encryption:', error.message);
    }
  });
});


const templateMenu = [
  {
      label: "File",
      submenu: [
          {
              label: 'Exit',
              accelerator: process.platform == 'darwin' ? 'command+Q' : 'Ctrl+Q',
              click(){
                  app.quit();
              }
          }
      ]
  },
 
];

if(process.env.NODE_ENV !== "production"){
    templateMenu.push({
        label: "DevTools",
        submenu: [
            {
                label: "Show/Hide Dev Tools",
                accelerator: "Ctrl+D",
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools()
                }
            },
            {
                role: "reload"
            }
        ]
    })
}