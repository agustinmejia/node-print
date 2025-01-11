const express = require('express');
const cors = require('cors');
const escpos = require('escpos'); // Módulo escpos
escpos.USB = require('escpos-usb'); // Soporte para USB

const app = express();
const port = 3010;
const corsOptions ={
    origin:'*', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200,
 }

// Middleware para manejar JSON
app.use(express.json());

app.use(cors(corsOptions))
app.options('*', cors());

// Ruta para imprimir ticket
app.get('/', (req, res) => {
    console.log('Servicio activo')
    res.send({success: 1, message: 'Servicio activo'});
})

app.get('/test', (req, res) => {
    try {
        console.log('Servicio activo')
        var device = null;
        try {
            device = new escpos.USB();
            const printer = new escpos.Printer(device);

            device.open((error) => {
                if (error) {
                    console.error('Error al abrir la impresora:', error);
                }
                printer
                    .size(1, 1)
                    .align('ct').style('NORMAL')
                    .text(`Impresión de pruba`)
                    .size(0, 0)
                    .text('desarrollocreativo.dev')
                printer.text('');
                printer.cut();
                printer.close();
            });

        } catch (error) {
            console.log('Error al conectarse a la impresora')
        }
        res.send({
            success: 1,
            message: 'Servidor activo',
            details: {
                print: device
            }
        });
    } catch (error) {
        console.error('Error en la petición', error);
        res.status(500).send({error: 1, message: 'Error en la petición http'});
    }
});

app.post('/print', (req, res) => {
    try {
        var { templeate } = req.body;

        switch (templeate) {
            case 'comanda':
                printComanda(req);
                break;
            default:
                printTemplateNormal(req);
                printComanda(req);
                break;
        }
        res.send('Ticket impreso correctamente');
    } catch (error) {
        console.error('Error en la petición', error);
        res.status(500).send('Error al imprimir el ticket');
    }
});

function printTemplateNormal(req){
    try {
        // Datos del cuerpo de la solicitud
        const { company_name, sale_number, payment_type, sale_type, table_number, discount, details, observations } = req.body;

        // Conectar a la impresora USB
        const device = new escpos.USB(); // Detecta automáticamente el dispositivo
        const printer = new escpos.Printer(device);

        device.open((error) => {
            if (error) {
                console.error('Error al abrir la impresora:', error);
                return res.status(500).send('Error al abrir la impresora');
            }

            // Iniciar impresión
            printer
                .align('ct').style('B').size(1, 1).text(company_name) // Nombre del restaurante
                .size(0, 0)
                .align('ct').style('NORMAL').text(`Ticket ${sale_number}`) // Número de ticket
                .size(0, 0)
                .align('ct').style('NORMAL').text(`${sale_type}${table_number ? ' '+table_number : ''}`) // Número de mesa
                .drawLine()
                .align('lt');

            // Imprimir los artículos
            var total = 0;
            details.forEach(item => {
                printer.tableCustom([
                    { text: item.product, align: 'LEFT', width: 0.56 },
                    { text: item.quantity, align: 'CENTER', width: 0.10 },
                    { text: `Bs.${item.total.toFixed(2)}`, align: 'RIGHT', width: 0.33 }
                ]);
                total += parseFloat(item.total);
            });

            printer.drawLine();
            if (discount) {
                printer.align('rt').style('B').text(`DESC: Bs.${discount.toFixed(2)}`);   
            }
            printer.align('rt').style('B').text(`TOTAL: Bs.${(total - discount).toFixed(2)}`);
            if (payment_type) {
                printer.text(`Pago: ${payment_type}`);   
            }
            printer.text('');
            printer.align('ct').style('NORMAL').text('Gracias por su preferencia!');
            printer.text('');
            printer.cut();
            printer.close();

            return 1;
        });
    } catch (error) {
        console.error('Error al imprimir el ticket:', error);
        return 0;
    }
}

function printComanda(req){
    try {
        // Datos del cuerpo de la solicitud
        const { sale_number, sale_type, table_number, discount, details, observations } = req.body;

        // Conectar a la impresora USB
        const device = new escpos.USB(); // Detecta automáticamente el dispositivo
        const printer = new escpos.Printer(device);

        device.open((error) => {
            if (error) {
                console.error('Error al abrir la impresora:', error);
                return res.status(500).send('Error al abrir la impresora');
            }

            // Iniciar impresión
            printer
                .align('ct').style('NORMAL').text(`Ticket ${sale_number}`)
                .size(0, 0)
                .align('ct').style('NORMAL').text(`${sale_type}${table_number ? ' '+table_number : ''}`)
                .drawLine()
                .align('lt');

            // Imprimir los artículos
            var total = 0;
            details.forEach(item => {
                printer.tableCustom([
                    { text: item.product, align: 'LEFT', width: 0.56 },
                    { text: item.quantity, align: 'CENTER', width: 0.10 },
                    { text: `Bs.${item.total.toFixed(2)}`, align: 'RIGHT', width: 0.33 }
                ]);
                total += parseFloat(item.total);
            });

            printer.drawLine();
            if (observations) {
                printer.align('lt').style('NORMAL').text(`Obs. ${observations}`);   
            }
            printer.text('');
            printer.cut();
            printer.close();

            return 1;
        });
    } catch (error) {
        console.error('Error al imprimir el ticket:', error);
        return 0;
    }
}

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
