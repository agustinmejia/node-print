# NodePrint
Micro servicio de impresión en impresoras esc/pos desde petición http.

## Instalación
```bash
npm i
node index.js
```

## Uso
Para imprimir se debe hacer mediante petición **POST** enviando el siguiente objeto **JSON**:

```json
{
    "templeate" : "", // "", "comanda"
    "company_name": "DesarrolloCreativo",
    "sale_number": "001",
    "payment_type" : "Efectivo",
    "sale_type" : "Mesa",
    "table_number" : 5,
    "discount" : 0,
    "observations" : "Sin aceitunas",
    "details" : [
        {
            "product" : "Pollo económico",
            "quantity" : 1,
            "total" : 12
        },
        {
            "product" : "Hamburguesa completa",
            "quantity" : 2,
            "total" : 24
        },
        {
            "product" : "Coca cola 1 lt.",
            "quantity" : 1,
            "total" : 10
        }
    ]
}
```

## Generar binario
```bash
npm install -g pkg
pkg -t node18-win-x64
```
Nota: Puede cambiar la versión de nodejs con la intalada en su computadora ***node -v***. En caso de estar usar windows puede que no funcione el comando **pgk**, por lo que deberá abrir **PowerShell** como administrador y ejecutar ***Set-ExecutionPolicy Unrestricted***.

## Problemas frecuentes
### Bug en la librería
Reemplazar la línea 52 del archivo ***node_modules\escpos-usb\index.js***
```
usb.usb.on('detach', function(device){
```

### Driver incompatible
1. Descarga [Zadig](https://zadig.akeo.ie/) desde su página oficial.
2. Conecta la impresora USB a tu computadora.
3. Abre Zadig y selecciona Options > List All Devices.
4. Busca tu impresora en la lista de dispositivos (por ejemplo, algo como "USB Printer").
5. En el desplegable de controladores, selecciona libusb-win32 o WinUSB.
6. Haz clic en Replace Driver para instalarlo.