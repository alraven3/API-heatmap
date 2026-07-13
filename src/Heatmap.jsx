import { useMemo } from "react";
import * as d3 from "d3";

const MARGIN = { top: 10, right: 10, bottom: 30, left: 100 }; // Augmentez left pour les noms de villes

export const Heatmap = ({ width, height, data }) => {
    if (!data || data.length === 0) {
    return null; // nécessaire pour éviter que JS lance automatiquement une erreur si data est null au premier rendu
  }
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  // Groups (inchangé, mais la sémantique change)
  const allXGroups = useMemo(() => [...new Set(data.map((d) => d.x))], [data]); // Semaines
  const allYGroups = useMemo(() => [...new Set(data.map((d) => d.y))], [data]); // Villes

  // X Scale (Semaines)
  const xScale = useMemo(() => {
    return d3
      .scaleBand()
      .range([0, boundsWidth])
      .domain(allXGroups)
      .padding(0.1);
  }, [data, width]);

  // Y Scale (Villes)
  const yScale = useMemo(() => {
    return d3
      .scaleBand()
      .range([0, boundsHeight]) // Range de 0 à height (haut en bas)
      .domain(allYGroups)
      .padding(0.1);
  }, [data, height]);

  const [min, max] = d3.extent(data, (d) => d.value);

  if (!min || !max || !data.length) {
    return null;
  }

  const colorScale = d3
    .scaleSequential()
    .interpolator(d3.interpolateInferno)
    .domain([min, max]);

  // Rectangles
  const allRects = data.map((d, i) => {
        // Formatage de la température pour afficher 1 décimale
    const tempFormatted = d.value.toFixed(1);
    
    // Création du texte du tooltip : "Ville\nSemaine: X\nTemp: Y°C"
    const tooltipText = `City: ${d.y}\nWeek: ${d.x}\nTemperature: ${tempFormatted}°C`;
    return (
      <rect
        key={i}
        x={xScale(d.x)}
        y={yScale(d.y)}
        width={xScale.bandwidth()}
        height={yScale.bandwidth()}
        opacity={1}
        fill={colorScale(d.value)}
        rx={2}
        stroke={"white"}
        strokeWidth={0.5}
      >
        {/* Cette balise crée le tooltip natif au survol */}
        <title>{tooltipText}</title>
      </rect>
    );
  });

  // X Labels (Semaines en bas)
const xLabels = allXGroups
    .filter((weekStr) => {
      const weekNum = parseInt(weekStr, 10);
      // On affiche seulement si le numéro de semaine est divisible par 5 (0, 5, 10, etc.)
      return weekNum % 5 === 0;
    })
    .map((name, i) => {
      const xPos = xScale(name) + xScale.bandwidth() / 2;
      return (
        <text
          key={i}
          x={xPos}
          y={boundsHeight + 20}
          textAnchor="middle"
          dominantBaseline="hanging"
          fontSize={12}
          fill="#555" // Optionnel: couleur un peu plus claire pour ne pas surcharger
        >
          {name}
        </text>
      );
    });

  // Y Labels (Villes à gauche)
  const yLabels = allYGroups.map((name, i) => {
    const yPos = yScale(name) + yScale.bandwidth() / 2;
    return (
      <text
        key={i}
        x={-10}
        y={yPos}
        textAnchor="end"
        dominantBaseline="middle"
        fontSize={12}
        fontWeight="500"
      >
        {name}
      </text>
    );
  });

  return (
    <div>
      <svg width={width} height={height}>
        <g
          width={boundsWidth}
          height={boundsHeight}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
        >
          {allRects}
          {xLabels}
          {yLabels}
        </g>
      </svg>
    </div>
  );
};