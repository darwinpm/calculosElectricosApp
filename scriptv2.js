"use strict";

// NOTE:
const DEMANDA_MAX_CIRCUITO = 12;
// NOTE:
const GENERIC_VALUE = 0.88;
// NOTE:
const ARRAY_OF_CIRCUITS = [];

// NOTE: Objeto que almacena toda la información de los calculos

/**
 * @description
 * @param {*} w
 * @param {*} fase
 * @returns
 */
const getIN = (w, fp, fase = 1) => {
  const en = fase === 1 ? 127 : 220;

  return {
    en,
    value: w / (en * fp),
  };
};

/**
 * @description
 * @param {*} calcIS
 */

// Calcular Nominal Size Luminarias
const getNominalSize = (calcIS) => {
  if (calcIS <= 20) {
    return {
      tamanoNominalConductor: 14,
      resistenciaNominal: 8.442,
      capacidadConduccionMaxima: 20,
    };
  }

  if (calcIS > 20 && calcIS <= 25) {
    return {
      tamanoNominalConductor: 12,
      resistenciaNominal: 5.315,
      capacidadConduccionMaxima: 25,
    };
  }

  if (calcIS > 25 && calcIS <= 35) {
    return {
      tamanoNominalConductor: 10,
      resistenciaNominal: 3.335,
      capacidadConduccionMaxima: 30,
    };
  }

  if (calcIS > 35 && calcIS <= 50) {
    return {
      tamanoNominalConductor: 8,
      resistenciaNominal: 2.093,
      capacidadConduccionMaxima: 40,
    };
  }

  if (calcIS > 50 && calcIS <= 65) {
    return {
      tamanoNominalConductor: 6,
      resistenciaNominal: 1.32,
      capacidadConduccionMaxima: 55,
    };
  }

  return {
    tamanoNominalConductor: 0,
    resistenciaNominal: 0,
    capacidadConduccionMaxima: 0,
  };
};

// Calcular Nominal Size Contactos
const getNominalSizeContactos = (calcIS) => {
  if (calcIS <= 25) {
    return {
      tamanoNominalConductor: 12,
      resistenciaNominal: 5.315,
      capacidadConduccionMaxima: 25,
    };
  }

  if (calcIS > 25 && calcIS <= 35) {
    return {
      tamanoNominalConductor: 10,
      resistenciaNominal: 3.335,
      capacidadConduccionMaxima: 30,
    };
  }

  if (calcIS > 35 && calcIS <= 50) {
    return {
      tamanoNominalConductor: 8,
      resistenciaNominal: 2.093,
      capacidadConduccionMaxima: 40,
    };
  }

  if (calcIS > 50 && calcIS <= 65) {
    return {
      tamanoNominalConductor: 6,
      resistenciaNominal: 1.32,
      capacidadConduccionMaxima: 55,
    };
  }

  return {
    tamanoNominalConductor: 0,
    resistenciaNominal: 0,
    capacidadConduccionMaxima: 0,
  };
};

// Calcular conductor a tierra
const getSizeConductorTierra = (calcIS) => {
  if (calcIS <= 15) {
    return {
      conductorTierra: 14,
    };
  }

  if (calcIS > 15 && calcIS <= 20) {
    return {
      conductorTierra: 12,
    };
  }

  if (calcIS > 20 && calcIS <= 60) {
    return {
      conductorTierra: 10,
    };
  }

  if (calcIS > 60 && calcIS <= 100) {
    return {
      conductorTierra: 8,
    };
  }

  if (calcIS > 100 && calcIS <= 200) {
    return {
      conductorTierra: 6,
    };
  }

  return {
    conductorTierra: 0,
  };
};

/**
 * @description
 * @param {number} w
 * @param {number} fase
 * @param {number} fp
 * @returns
 */
const obtenerValorIN = (w, fase = 1, fp = 0.9) => {
  const { value: valorIN, en } = getIN(w, fp, fase);

  const maximoDeLamparasPorCircuito = Math.floor(
    DEMANDA_MAX_CIRCUITO / valorIN
  );

  return {
    w,
    en,
    fp,
    in: valorIN.toFixed(2),
    maximoDeLamparasPorCircuito,
  };
};

/**
 * @description Funcion para los calculos de las luminarias
 * @param {*} name
 * @param {*} w
 * @param {*} distancia
 * @param {*} fase
 * @param {*} fp
 */
const calcLuminaria = (name = undefined, w, distancia, fase = 1, fp = 0.9) => {
  const circuitoLuminaria = {
    nombre: "",
    in: 0,
    is: 0,
    tamañoConductor: 0,
    resistenciaNom: 0,
    caidaTension: 0,
    porcentajeCaidaTension: 0,
    distancia: 0,
  };

  const distanciaKM = distancia / 1000;
  const { value: valorIN, en } = getIN(w, fp, fase);
  const calcIS = +(valorIN * 1.25).toFixed(2);
  const {
    capacidadConduccionMaxima,
    resistenciaNominal,
    tamanoNominalConductor,
  } = getNominalSize(calcIS);
  const caidaDeTension = 2 * resistenciaNominal * distanciaKM * valorIN;
  const porcentajeDeCaidaDeTension = (caidaDeTension / en) * 100;

  circuitoLuminaria.nombre = name;
  circuitoLuminaria.distancia = distanciaKM;
  circuitoLuminaria.in = +valorIN.toFixed(2);
  circuitoLuminaria.is = calcIS;
  circuitoLuminaria.tamañoConductor = tamanoNominalConductor;
  circuitoLuminaria.resistenciaNom = resistenciaNominal;
  circuitoLuminaria.caidaTension = +caidaDeTension.toFixed(2);
  circuitoLuminaria.porcentajeCaidaTension =
    +porcentajeDeCaidaDeTension.toFixed(2);

  return {
    circuitoLuminaria,
    isGretherThanCalcIS: capacidadConduccionMaxima * GENERIC_VALUE > calcIS,
    isChangeConducts: porcentajeDeCaidaDeTension >= 3,
    porcentajeDeCaidaDeTension,
    capacidadConduccionMaxima,
    w,
    en,
    fp,
  };
};

// Funcion calculo circuito de contactos
const calcContactos = (name = undefined, w, distancia, fase = 1, fp = 0.9) => {
  const circuitoContactos = {
    nombre: "",
    in: 0,
    is: 0,
    tamañoConductor: 0,
    resistenciaNom: 0,
    caidaTension: 0,
    porcentajeCaidaTension: 0,
    distancia: 0,
  };

  const distanciaKM = distancia / 1000;
  const { value: valorIN, en } = getIN(w, fp, fase);
  const calcIS = +(valorIN * 1.25).toFixed(2);
  const {
    capacidadConduccionMaxima,
    resistenciaNominal,
    tamanoNominalConductor,
  } = getNominalSizeContactos(calcIS);
  const { conductorTierra } = getSizeConductorTierra(calcIS);
  const caidaDeTension = 2 * resistenciaNominal * distanciaKM * valorIN;
  const porcentajeDeCaidaDeTension = (caidaDeTension / en) * 100;

  circuitoContactos.nombre = name;
  circuitoContactos.distancia = distanciaKM;
  circuitoContactos.in = +valorIN.toFixed(2);
  circuitoContactos.is = calcIS;
  circuitoContactos.tamañoConductor = tamanoNominalConductor;
  circuitoContactos.resistenciaNom = resistenciaNominal;
  circuitoContactos.caidaTension = +caidaDeTension.toFixed(2);
  circuitoContactos.porcentajeCaidaTension =
    +porcentajeDeCaidaDeTension.toFixed(2);
  circuitoContactos.conductorTierra = conductorTierra;
  return {
    circuitoContactos,
    isGretherThanCalcIS: capacidadConduccionMaxima * GENERIC_VALUE > calcIS,
    isChangeConducts: porcentajeDeCaidaDeTension >= 3,
    porcentajeDeCaidaDeTension,
    capacidadConduccionMaxima,
    w,
    en,
    fp,
  };
};

//Función para calcular climas
const calcClimas = (name = undefined, w, distancia, fase = 1, fp = 0.9) => {
  const circuitoContactos = {
    nombre: "",
    in: 0,
    is: 0,
    tamañoConductor: 0,
    resistenciaNom: 0,
    caidaTension: 0,
    porcentajeCaidaTension: 0,
    distancia: 0,
  };

  const distanciaKM = distancia / 1000;
  const { value: valorIN, en } = getIN(w, fp, (fase = 2));
  const calcIS = +(valorIN * 1.25).toFixed(2);
  const {
    capacidadConduccionMaxima,
    resistenciaNominal,
    tamanoNominalConductor,
  } = getNominalSizeContactos(calcIS);
  const { conductorTierra } = getSizeConductorTierra(calcIS);
  const caidaDeTension = 2 * resistenciaNominal * distanciaKM * valorIN;
  const porcentajeDeCaidaDeTension = (caidaDeTension / en) * 100;

  circuitoContactos.nombre = name;
  circuitoContactos.distancia = distanciaKM;
  circuitoContactos.in = +valorIN.toFixed(2);
  circuitoContactos.is = calcIS;
  circuitoContactos.tamañoConductor = tamanoNominalConductor;
  circuitoContactos.resistenciaNom = resistenciaNominal;
  circuitoContactos.caidaTension = +caidaDeTension.toFixed(2);
  circuitoContactos.porcentajeCaidaTension =
    +porcentajeDeCaidaDeTension.toFixed(2);
  circuitoContactos.conductorTierra = conductorTierra;
  return {
    circuitoContactos,
    isGretherThanCalcIS: capacidadConduccionMaxima * GENERIC_VALUE > calcIS,
    isChangeConducts: porcentajeDeCaidaDeTension >= 3,
    porcentajeDeCaidaDeTension,
    capacidadConduccionMaxima,
    w,
    en,
    fp,
  };
};
/**
 * @description
 * @param {*} param0
 */
const printINValue = ({
  en,
  fp,
  in: inValue,
  maximoDeLamparasPorCircuito,
  w,
}) => {
  const log = `CALCULO DE CORRIENTE NOMINAL ⚡
    In = ${w} / ${en} x ${fp} = ${inValue} amp.

    CALCULO MAXIMO DE LAMPARAS POR CIRCUITO
    # Máx.Lamparas = ${DEMANDA_MAX_CIRCUITO} / ${inValue} = ${maximoDeLamparasPorCircuito};
  `;

  console.log(log);
};

/**
 * @description RENDERIZA INFORMACIÓN DE LAS LUMINARIAS
 * @param {*} param0
 */
const printCalcLuminaria = ({
  circuitoLuminaria,
  isGretherThanCalcIS,
  isChangeConducts,
  porcentajeDeCaidaDeTension,
  capacidadConduccionMaxima,
  w,
  en,
  fp,
}) => {
  if (isGretherThanCalcIS) {
    console.log(`CALCULO CAPACIDAD DE CONDUCCION ⚡
${capacidadConduccionMaxima * GENERIC_VALUE} ES MAYOR QUE ${
      circuitoLuminaria.is
    }.
Se pueden utilizar los conductores propuestos 😏`);
  } else {
    console.log(`${capacidadConduccionMaxima * GENERIC_VALUE} ES MENOR QUE ${
      circuitoLuminaria.is
    }.
    ES NECESARIO CAMBIAR EL TAMAÑO DE LOS CONDUCTORES 😥`);
  }

  if (isChangeConducts) {
    console.log(
      "EL PORCENTAJE DE CAIDA DE TENSION ES MAYOR AL 3%, CAMBIAR TAMAÑO DE CONDUCTOS 😔"
    );
  }

  const log = `CALCULOS PARA EL CIRCUITO ${circuitoLuminaria.nombre} ⚡
--Cálculo In--
In = ${w} / ${en} x ${fp} = ${circuitoLuminaria.in} amp.
--Cálculo Is--
Is = ${circuitoLuminaria.in} x 1.25 = ${circuitoLuminaria.is} amp.
--Tamaño De Conductor--
El tamaño de conductor propuesto es: ${circuitoLuminaria.tamañoConductor}
--Resistencia Nominal del Conductor--
La resistencia nominal es: ${circuitoLuminaria.resistenciaNom}
--Comprobación Capacidad de Conducción—-

--Calculo Caída de Tension--
e = 2 x ${circuitoLuminaria.resistenciaNom} x ${
    circuitoLuminaria.distancia
  }km x ${circuitoLuminaria.in} = ${circuitoLuminaria.caidaTension}
--Calculo porcentaje de caída de Tensión--
%e = (${
    circuitoLuminaria.caidaTension
  } / ${en}) x 100 = ${+porcentajeDeCaidaDeTension.toFixed(2)}%
  
Para el circuito ${
    circuitoLuminaria.nombre
  } se proponen los siguientes conductores:
Fase #${circuitoLuminaria.tamañoConductor}
Neutro #${circuitoLuminaria.tamañoConductor}`;

  console.log(log);
};

const printCalcContactos = ({
  circuitoContactos,
  isGretherThanCalcIS,
  isChangeConducts,
  porcentajeDeCaidaDeTension,
  capacidadConduccionMaxima,
  w,
  en,
  fp,
}) => {
  if (isGretherThanCalcIS) {
    console.log(`CALCULO CAPACIDAD DE CONDUCCION ⚡
${capacidadConduccionMaxima * GENERIC_VALUE} ES MAYOR QUE ${
      circuitoContactos.is
    }.
Se pueden utilizar los conductores propuestos 😏`);
  } else {
    console.log(`${capacidadConduccionMaxima * GENERIC_VALUE} ES MENOR QUE ${
      circuitoContactos.is
    }.
    ES NECESARIO CAMBIAR EL TAMAÑO DE LOS CONDUCTORES 😥`);
  }

  if (isChangeConducts) {
    console.log(
      "EL PORCENTAJE DE CAIDA DE TENSION ES MAYOR AL 3%, CAMBIAR TAMAÑO DE CONDUCTOS 😔"
    );
  }

  const log = `CALCULOS PARA EL CIRCUITO ${circuitoContactos.nombre} ⚡
--Cálculo In--
In = ${w} / ${en} x ${fp} = ${circuitoContactos.in} amp.
--Cálculo Is--
Is = ${circuitoContactos.in} x 1.25 = ${circuitoContactos.is} amp.
--Tamaño De Conductor--
El tamaño de conductor propuesto es: ${circuitoContactos.tamañoConductor}
--Resistencia Nominal del Conductor--
La resistencia nominal es: ${circuitoContactos.resistenciaNom}
--Comprobación Capacidad de Conducción--
--Tamaño Conductor A Tierra--
El tamaño del conductor a tierra propuesto: ${circuitoContactos.conductorTierra}
--Calculo caída de Tensión--
e = 2 x ${
    circuitoContactos.resistenciaNom
  } x ${+circuitoContactos.distancia.toFixed(4)}km x ${
    circuitoContactos.in
  } = ${circuitoContactos.caidaTension}
--Calculo porcentaje de caída de Tensión--
%e = (${
    circuitoContactos.caidaTension
  } / ${en}) x 100 = ${+porcentajeDeCaidaDeTension.toFixed(2)}%
Para el circuito ${
    circuitoContactos.nombre
  } se proponen los siguientes conductores:
Fase #${circuitoContactos.tamañoConductor}
Neutro #${circuitoContactos.tamañoConductor}
Tierra #${circuitoContactos.conductorTierra}`;

  console.log(log);
};

printINValue(obtenerValorIN(46, 1));
// printCalcLuminaria(calcLuminaria("L1", 975, 21));
// Calculos Luminarias
printCalcLuminaria(calcLuminaria("L1", 443 - 46, 22.25));
printCalcLuminaria(calcLuminaria("L2", 543.3 - 48, 31.8));

// Calculos Contacos
printCalcContactos(calcContactos("C1", 162, 28.47));
printCalcContactos(calcContactos("C2", 162 * 8, 26.54));
printCalcContactos(calcContactos("C3", 162, 20.89));
printCalcContactos(calcContactos("C4", 162, 18.35));
printCalcContactos(calcContactos("C5", 162, 24.8));
printCalcContactos(calcContactos("C6", 162 * 7, 25.3));
printCalcContactos(calcContactos("C7", 162 * 7, 20.63));

// Calculos Aires
printCalcContactos(calcClimas("AA1", 3515, 22));
printCalcContactos(calcClimas("AA2", 3515, 21.6));

// Calculos Bomba
printCalcLuminaria(calcLuminaria("B1", 618, 21));
printCalcContactos(calcContactos("B2", 618, 21));

// console.log(3 * 25 + 8 * 46);
// console.log(18.25 + 2.5 + 1.5);
// 3 * 25 + 8 * 46;
// 3 + 8;
// 4 + 4 + 4 + 2 + 2 + 2 + 2 + 2 + 2 + 2 + 2;
// 18.25 + 2.5 + 1.5;
// 12.43 + 6.1;

// // circuito 2

// // 1(4) + 3(2) + 5(2) + 6(3) + 7(9) + 8(3) + 9(4);
// // 25 + 37(2) + 36(2) + 20(3) + 18(9) + 6.1(3) + 12(4);
// console.log(25 + 37 * 2 + 36 * 2 + 20 * 3 + 18 * 9 + 6.1 * 3 + 12 * 5 + 3 * 24);
// 7.4 + 18.5 + 4.4 + 1.5;
// console.log(7.4 + 18.5 + 4.4 + 1.5);
// console.log(0.15 + 19.5 + 0.7 + 1.5);
// console.log(0.15 + 13.5 + 5 + 1.5 + 1.21 + 0.23);
