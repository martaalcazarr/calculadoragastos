//VARIABLES Y SELECTORES

//selecciono variables con su id
const formulario = document.querySelector('#agregar-gasto');
//dentro de gastos selecciono el ul
const gastosListado = document.querySelector('#gastos ul')


//EVENTOS

eventListeners();
function eventListeners(){
    //DOMcontentloaded es que cuando el documento esté cargado ejecute preguntarpresupuesto
    //preguntarpresupuesto va sin () porque la estoy llamando desde otro lugar, no directamnte en el js
    document.addEventListener('DOMContentLoaded', preguntarPresupuesto);

    formulario.addEventListener('submit', agregarGasto);
}


//CLASES (las clases son para los objetos)

class Presupuesto {
    constructor(presupuesto){
        this.presupuesto = Number(presupuesto);
        //presupuesto se mantendra,pero restante sera modificado
        this.restante = Number(presupuesto);
        //gastos empieza como un arreglo vacio
        this.gastos = [];
    }

    //método
    nuevoGasto(gasto){
        //tomamos una copia de this.gastos y le agregamos el nuevo gasto
        this.gastos = [...this.gastos, gasto];
        this.calcularRestante();
        }

    //metodo
    calcularRestante(){
        //uso arraymethod reduce
        //le paso 2 parametros, primero el total, y despues el actual, el gasto
        //sumamos el total con la cantidad nueva, e iniciamos en 0
        const gastado = this.gastos.reduce((total, gasto) => total + gasto.cantidad, 0
        );
        this.restante = this.presupuesto -gastado;
    }

    //metodo
    eliminarGasto(id){
        //filter e itero sobre cada gasto, accedo a gasto.id, y 
        //traigo todos excepto el id seleccionado
        this.gastos = this.gastos.filter( gasto => gasto.id != id);
        //va a iterar sobre los gastos para decir el restante
        this.calcularRestante();
    }
}
//interfaz usuario es ui, no requiere constructor porque seran metodos
//para imprimir html basados en presupuesto
class UI {
    //metodo
    insertarPresupuesto(cantidad){
        //extraigo los valores
        const {presupuesto, restante} = cantidad;
        //para agregarlos al html, selecciono los span desde el html
        //por id para asignarles el contenido
        document.querySelector('#total').textContent = presupuesto;
        document.querySelector('#restante').textContent = restante;
    }

    //metodo
    imprimirAlerta(mensaje, tipo){
        //crear el div en el html
        const divMensaje = document.createElement('div');
        //le agrego clases para darle formato, alert es una clase de bootstrap
        divMensaje.classList.add('text-center', 'alert');
        if(tipo === 'error'){
            //si el mensaje es de tipo error, le agrego una clas de bootstrap 
            //para pintar una alerta en color rojo
            divMensaje.classList.add('alert-danger')
        } else {//sino pinta una alerta en color verde conla class de bootstrap
            divMensaje.classList.add('alert-success')
        }

        //agrego mensaje de error
        //lo que este en el textcontent sera el mensaje que le pasamos
        divMensaje.textContent = mensaje;

        //insertar en el html
        //selecciono por su clase con ., y en insert before le paso lo que quiero insertar
        //el divmensaje y donde, antes de formulario
        document.querySelector('.primario').insertBefore(divMensaje, formulario);

        //quitarlo del html 3 seg despues
        setTimeout(() => {
            divMensaje.remove();
        }, 3000);
    }

    mostrarGastos(gastos){

        this.limpiarHTML(); //elimina el html previo

        //iterar sobre los gastos
        gastos.forEach(gasto => {
            const { cantidad, nombre, id} = gasto;
            
            //crear un LI
            const nuevoGasto = document.createElement('li');
            //le asignamos clases de bootstrap por su nombre para darle formato al li
            nuevoGasto.className = 'list-group-item d-flex justify-content-between align-items-center';
            //le agregamos un nuevo atributo para asignarle a cada li su id con dataset
            nuevoGasto.dataset.id = id
            //console.log(nuevoGasto)

            //agregar el html del gasto
            //agrego este html a nuevogasto con innerhtml
            //badge es una clase de bootstrap
            nuevoGasto.innerHTML = `${nombre } <span class="badge badge-primary bagde-pill">  ${cantidad} CLP</span>`;


            //boton para borrar el gasto
            //creo el elemento de tipo boton
            //le doy clases de bootstrap para darle formato
            const btnBorrar = document.createElement('button');
            btnBorrar.classList.add('btn', 'btn-danger', 'borrar-gasto');
            btnBorrar.innerHTML = 'Borrar &times;'
            //arrowfunction para que llame eliminargasto solo cuando den click
            //y lo borra segun la id
            btnBorrar.onclick = () => {
                eliminarGasto(id);
            }
            //le agrego el boton a nuevogasto
            nuevoGasto.appendChild(btnBorrar);


            //agregar el html
            gastosListado.appendChild(nuevoGasto);

        })
    }
    limpiarHTML(){
        //si gastoslistado tiene algo, lo borra
        while(gastosListado.firstChild){
            gastosListado.removeChild(gastosListado.firstChild);
        }
    }
    actualizarRestante(restante){
        document.querySelector('#restante').textContent = restante;
    }

    comprobarPresupuesto(presupuestoObj) {
        //destructuring
        const {presupuesto, restante} = presupuestoObj;
        //selecciono el div por la clase restante con .
        const restanteDiv = document.querySelector('.restante')
        //comprobar si queda menos de 25% del presupuesto
        //si divido mi presupuesto entre 4 y eso es mas 
        //grande que el restante, he gastado más de 75%
        if( (presupuesto / 4) > restante){
            //entonces quito el verde de mi div(o amarillo si estaba) y le pongo rojo con bootstrap
            restanteDiv.classList.remove('alert-success', 'alert-warning');
            restanteDiv.classList.add('alert-danger');
            //para comprobar si queda menos del 50% de presupuesto
        }else if ((presupuesto /2) > restante){
            restanteDiv.classList.remove('alert-success');
            restanteDiv.classList.add('alert-warning');
        } else {//cualquier otra condición
            restanteDiv.classList.remove('alert-danger', 'alert-warning');
            restanteDiv.classList.add('alert-success')
        }

        //si el presupuesto se agota, el boton de agregar se desactiva
        if(restante <= 0){
            ui.imprimirAlerta('El presupuesto se ha agotado', 'error');
            formulario.querySelector('button[type="submit"]').disabled = true;
        }
    }
}

//INSTANCIAR

//instanciado de forma global para poder acceder a el en las funciones
const ui = new UI();
//creamos la variable presupuesto pero sin valor, para despues
//cuando tenga un presupuesto, le asigno un valor

let presupuesto;

//FUNCIONES

function preguntarPresupuesto(){
    const presupuestoUsuario = prompt('¿Cuál es tu presupuesto?');
    //console.log(presupuestoUsuario);
    if(presupuestoUsuario === '' || presupuestoUsuario === null || isNaN(presupuestoUsuario) || presupuestoUsuario <= 0){
        //para que vuelva a cargar el prompt si presupuestousuario no tiene nada o 
        //si el usuario dio click en cancelar y la variante queda como null
        //o si  presupuestousuario isNotaNumber
        window.location.reload();
    }
    //presupuesto valido
    presupuesto = new Presupuesto(presupuestoUsuario);
    //console.log(presupuesto);

    //aqui presupuesto es la cantidad
    ui.insertarPresupuesto(presupuesto)
}

//añadir gastos
//es un submit asi que le paso el evento, que es submit
//y al evento le haremos preventdefault para que no me quiera llevar a otra pagina
function agregarGasto(e){
    e.preventDefault();
    //leer los datos del formulario
    //selecciono el id en el html y su valor
    const nombre = document.querySelector('#gasto').value;
    //Number para que convierta el valor que le pasamos en un numero y no un string
    const cantidad = Number(document.querySelector('#cantidad').value);

    //validar los campos
    if(nombre === '' || cantidad === ''){
        ui.imprimirAlerta('Ambos campos son obligatorios', 'error');
        return; //para que deje de ejecutarse si el if se cumple
    }else if(cantidad <= 0 || isNaN(cantidad)){
        ui.imprimirAlerta('La cantidad no es válida', 'error');
        return;
    }
    
    //para crear un objeto con el gasto
    //lo contrario a un destructuring es
    //object literal enhancement, une nombre y cantidad a gasto
    //y destructuring extraeria nombre y cantidad de gasto
    //el id con la fecha actual es para diferenciar un gasto de otro
    const gasto = {
        nombre,
        cantidad,
        id: Date.now()
    }

    //añadir un nuevo gasto
    presupuesto.nuevoGasto(gasto);
    //no es necesario poner de que tipo es la alerta porque 
    //solo evaluo si es error, sino tiro el else de imprimiralerta
    ui.imprimirAlerta('Gasto agregado');

    //imprimir los gastos en el html
    //nuevo metodo
    //extraigo los gastos de presupuesto con destructuring
    const {gastos, restante} = presupuesto;
    ui.mostrarGastos(gastos)
    //nuevo metodo
    ui.actualizarRestante(restante);
    //nuevo metodo
    ui.comprobarPresupuesto(presupuesto);
    //reinicio el formulario para poder seguir escribiendo gastos
    formulario.reset();
}

function eliminarGasto(id){
    //elimina los gastos internamente (objeto)(se ve desde la consola)
    presupuesto.eliminarGasto(id);
    //elimina los gastos en el html
    const {gastos, restante} = presupuesto;
    ui.mostrarGastos(gastos);
    ui.actualizarRestante(restante);
    ui.comprobarPresupuesto(presupuesto);
}