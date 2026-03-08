import { v4 as uuidv4 } from 'uuid';

export type Template = {
  id: string;
  name: string;
  category: string;
  contentJson: any[];
};

// Generador de plantillas variadas para llegar a 50
const categories = ["SaaS", "E-commerce", "Agencia", "Coach/Fitness", "Real Estate", "Restaurante", "Evento", "Portfolio", "Consultoría", "App Móvil"];

const colorThemes = [
  { p: "#3A7BFF", t: "#FFFFFF" }, // Blue
  { p: "#10B981", t: "#FFFFFF" }, // Green
  { p: "#F59E0B", t: "#FFFFFF" }, // Amber
  { p: "#EC4899", t: "#FFFFFF" }, // Pink
  { p: "#0F172A", t: "#F8FAFC" }, // Dark Slate
];

const generateHero = (name: string, category: string, vIndex: number) => ({
  id: uuidv4(),
  type: "hero",
  data: {
    title: `${name}`,
    subtitle: `Solución experta para tu negocio de ${category}. Empieza hoy y escala al siguiente nivel con nuestras herramientas preparadas para ti.`,
    buttonText: `Comenzar (${category})`
  },
  style: {
    marginTop: vIndex * 15,
    marginBottom: vIndex * 20,
    buttonColor: colorThemes[vIndex - 1].p,
    buttonTextColor: colorThemes[vIndex - 1].t,
  }
});

const generateFeatures = (category: string, vIndex: number) => ({
  id: uuidv4(),
  type: "features",
  data: {
    title: `¿Por qué elegirnos para tu ${category}?`,
    items: `✅ Soporte 24/7 inigualable\n✅ Implementación rápida garantizada\n✅ Integraciones premium incluidas\n✅ Diseño hecho a medida`
  },
  style: {
    marginTop: 20 + (vIndex * 5),
    marginBottom: 20 + (vIndex * 5)
  }
});

const generateCta = (vIndex: number) => ({
  id: uuidv4(),
  type: "cta",
  data: {
    title: "¿Listo para transformar tu negocio?",
    buttonText: "Agendar Llamada Ahora"
  },
  style: {
    marginTop: 10 * vIndex,
    marginBottom: 0,
    buttonColor: colorThemes[vIndex - 1].p,
    buttonTextColor: colorThemes[vIndex - 1].t,
  }
});

export const templates: Template[] = [];

// Generar 50 plantillas (5 variaciones por 10 categorías)
categories.forEach((cat, catIdx) => {
  for (let i = 1; i <= 5; i++) {
    templates.push({
      id: `tpl-${catIdx}-${i}`,
      name: `Plantilla ${cat} V${i}`,
      category: cat,
      contentJson: [
        generateHero(`Diseño Elite ${cat} ${i > 3 ? 'PRO' : ''}`, cat, i),
        generateFeatures(cat, i),
        generateCta(i)
      ]
    });
  }
});
