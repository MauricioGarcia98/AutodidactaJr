import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, Caption, FONT, Link, Scene, Table, Title, prog, rowY} from './components';

export const DUR = {intro: 120, one: 160, many: 190, nm: 280, star: 380, galaxy: 400, outro: 180};

/* ---------- Intro ---------- */
export const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const nodes: [number, number, string][] = [[560, 700, C.blue], [960, 640, C.orange], [1360, 700, C.green]];
  return (
    <Scene f={f} dur={DUR.intro}>
      <g fontFamily={FONT} textAnchor="middle">
        <text x={960} y={380} fontSize={96} fontWeight={900} fill={C.text} opacity={prog(f, 5, 25)}>Modelado de datos</text>
        <text x={960} y={470} fontSize={44} fill={C.blue} opacity={prog(f, 25, 25)}>Cardinalidades · Esquema estrella · Esquema galaxia</text>
      </g>
      {nodes.map(([x, y, c], i) => (
        <g key={i} opacity={prog(f, 45 + i * 8, 15)}>
          <circle cx={x} cy={y} r={34} fill={c} />
        </g>
      ))}
      <Link a={[594, 690]} b={[926, 646]} p={prog(f, 70, 25)} color={C.line} />
      <Link a={[994, 646]} b={[1326, 690]} p={prog(f, 80, 25)} color={C.line} />
    </Scene>
  );
};

/* ---------- 1:1 ---------- */
export const OneToOne: React.FC = () => {
  const f = useCurrentFrame();
  const y = 260;
  return (
    <Scene f={f} dur={DUR.one}>
      <Title text="Cardinalidad 1 : 1" sub="Cada fila de A se relaciona con, como máximo, una fila de B" p={prog(f, 0, 20)} />
      <Table x={380} y={y} w={420} title="PERSONA" color={C.blue} p={prog(f, 10, 20)}
        rows={[{text: '1 · Ana', tag: 'PK'}, {text: '2 · Luis'}, {text: '3 · Eva'}]} />
      <Table x={1120} y={y} w={420} title="PASAPORTE" color={C.green} p={prog(f, 20, 20)}
        rows={[{text: 'P-901 · persona 1', tag: 'FK'}, {text: 'P-902 · persona 2'}, {text: 'P-903 · persona 3'}]} />
      {[0, 1, 2].map((i) => (
        <Link key={i} a={[800, rowY(y, i)]} b={[1120, rowY(y, i)]} curve p={prog(f, 45 + i * 12, 25)} color={C.orange} />
      ))}
      <Link a={[760, 700]} b={[1160, 700]} aKind="one" bKind="one" p={prog(f, 90, 30)} color={C.orange} />
      <Caption p={prog(f, 105, 25)} lines={['Un vínculo único en cada lado', 'La FK lleva una restricción UNIQUE (ej.: persona → pasaporte)']} y={820} />
    </Scene>
  );
};

/* ---------- 1:N ---------- */
export const OneToMany: React.FC = () => {
  const f = useCurrentFrame();
  const y = 250;
  const L = [0, 0, 1, 0];
  const pulse = prog(f, 95, 15) * (1 - prog(f, 125, 20));
  return (
    <Scene f={f} dur={DUR.many}>
      <Title text="Cardinalidad 1 : N" sub="Una fila de A se relaciona con muchas filas de B" p={prog(f, 0, 20)} />
      <Table x={380} y={y + 40} w={420} title="CLIENTE" color={C.blue} p={prog(f, 10, 20)}
        hl={{0: pulse}} rows={[{text: '1 · Ana', tag: 'PK'}, {text: '2 · Luis'}]} />
      <Table x={1120} y={y} w={420} title="PEDIDO" color={C.pink} p={prog(f, 20, 20)}
        hl={{0: pulse, 1: pulse, 3: pulse}}
        rows={[{text: '#101 · cliente 1', tag: 'FK'}, {text: '#102 · cliente 1'}, {text: '#103 · cliente 2'}, {text: '#104 · cliente 1'}]} />
      {L.map((c, i) => (
        <Link key={i} a={[800, rowY(y + 40, c)]} b={[1120, rowY(y, i)]} curve p={prog(f, 45 + i * 12, 25)} color={C.orange} />
      ))}
      <Link a={[760, 700]} b={[1160, 700]} aKind="one" bKind="many" p={prog(f, 100, 30)} color={C.orange} />
      <Caption p={prog(f, 115, 25)} lines={['Ana (1) tiene muchos pedidos (N)', 'La FK vive siempre en el lado "muchos": PEDIDO.id_cliente']} y={820} />
    </Scene>
  );
};

/* ---------- N:M ---------- */
export const ManyToMany: React.FC = () => {
  const f = useCurrentFrame();
  const y = 250;
  const direct: [number, number][] = [[0, 0], [0, 1], [1, 0], [2, 1], [2, 2]];
  const fade = 1 - prog(f, 105, 20);
  const bridge = prog(f, 120, 25);
  const enr = [0, 0, 1, 2, 2];
  const cur = [0, 1, 0, 1, 2];
  return (
    <Scene f={f} dur={DUR.nm}>
      <Title text="Cardinalidad N : M" sub="Muchas filas de A con muchas filas de B" p={prog(f, 0, 20)} />
      <Table x={80} y={y} w={360} title="ESTUDIANTE" color={C.blue} p={prog(f, 10, 20)}
        rows={[{text: 'Ana', tag: 'PK'}, {text: 'Luis'}, {text: 'Eva'}]} />
      <Table x={1480} y={y} w={360} title="CURSO" color={C.green} p={prog(f, 15, 20)}
        rows={[{text: 'SQL', tag: 'PK'}, {text: 'Python'}, {text: 'Excel'}]} />
      <g opacity={fade}>
        {direct.map(([a, b], i) => (
          <Link key={i} a={[440, rowY(y, a)]} b={[1480, rowY(y, b)]} curve p={prog(f, 40 + i * 9, 25)} color={C.orange} />
        ))}
      </g>
      <Caption p={prog(f, 70, 20) * fade} lines={['Una relación directa N:M no se puede guardar con una sola FK']} y={650} color={C.orange} />
      <Table x={700} y={y} w={520} title="INSCRIPCIÓN (tabla puente)" color={C.orange} p={bridge}
        rows={[{text: 'Ana · SQL', tag: 'PK'}, {text: 'Ana · Python'}, {text: 'Luis · SQL'}, {text: 'Eva · Python'}, {text: 'Eva · Excel'}]} />
      {enr.map((e, i) => (
        <Link key={`l${i}`} a={[440, rowY(y, e)]} b={[700, rowY(y, i)]} curve p={prog(f, 150 + i * 6, 25)} color={C.blue} />
      ))}
      {cur.map((c, i) => (
        <Link key={`r${i}`} a={[1220, rowY(y, i)]} b={[1480, rowY(y, c)]} curve p={prog(f, 150 + i * 6, 25)} color={C.green} />
      ))}
      <Link a={[480, 760]} b={[760, 760]} aKind="one" bKind="many" p={prog(f, 190, 25)} color={C.blue} />
      <Link a={[1440, 760]} b={[1160, 760]} aKind="one" bKind="many" p={prog(f, 190, 25)} color={C.green} />
      <Caption p={prog(f, 185, 25)} lines={['N : M  =  1 : N  +  N : 1', 'La tabla puente guarda las dos FK (clave primaria compuesta)']} y={850} />
    </Scene>
  );
};

/* ---------- Estrella ---------- */
export const Star: React.FC = () => {
  const f = useCurrentFrame();
  const fx = 780; const fy = 410; const fw = 360;
  const dims: {t: string; x: number; y: number; c: string; rows: string[]; ax: number; ay: number; bx: number; by: number}[] = [
    {t: 'DIM_CLIENTE', x: 110, y: 190, c: C.blue, rows: ['id_cliente', 'nombre', 'ciudad', 'segmento'], ax: 470, ay: 292, bx: fx, by: fy + 90},
    {t: 'DIM_PRODUCTO', x: 1450, y: 190, c: C.green, rows: ['id_producto', 'nombre', 'categoría', 'marca'], ax: 1450, ay: 292, bx: fx + fw, by: fy + 90},
    {t: 'DIM_TIEMPO', x: 110, y: 680, c: C.purple, rows: ['id_fecha', 'día', 'mes', 'año'], ax: 470, ay: 782, bx: fx, by: fy + 180},
    {t: 'DIM_TIENDA', x: 1450, y: 680, c: C.pink, rows: ['id_tienda', 'nombre', 'región', 'país'], ax: 1450, ay: 782, bx: fx + fw, by: fy + 180},
  ];
  const tags = ['PK', 'PK', 'PK', 'PK'];
  return (
    <Scene f={f} dur={DUR.star}>
      <Title text="Esquema estrella (star schema)" sub="1 tabla de hechos al centro + dimensiones desnormalizadas alrededor" p={prog(f, 0, 20)} />
      <Table x={fx} y={fy} w={fw} title="FACT_VENTAS" color={C.orange} p={prog(f, 15, 25)}
        rows={[{text: 'id_cliente', tag: 'FK'}, {text: 'id_producto', tag: 'FK'}, {text: 'id_fecha', tag: 'FK'}, {text: 'id_tienda', tag: 'FK'}, {text: 'cantidad · monto'}]} />
      {dims.map((d, i) => (
        <g key={d.t}>
          <Table x={d.x} y={d.y} w={360} title={d.t} color={d.c} p={prog(f, 50 + i * 25, 25)}
            rows={d.rows.map((r, j) => ({text: r, tag: j === 0 ? tags[i] : undefined}))} />
          <Link a={[d.ax, d.ay]} b={[d.bx, d.by]} aKind="one" bKind="many" p={prog(f, 85 + i * 25, 30)} color={d.c} />
        </g>
      ))}
      <Caption p={prog(f, 200, 25)} lines={['Cada dimensión (1) se relaciona con muchos hechos (N)', 'Los hechos guardan métricas; las dimensiones, el contexto para filtrar y agrupar']} y={930} />
      <Caption p={prog(f, 280, 25)} lines={['Pocos JOINs → consultas rápidas y simples para BI']} y={1030} color={C.orange} />
    </Scene>
  );
};

/* ---------- Galaxia ---------- */
export const Galaxy: React.FC = () => {
  const f = useCurrentFrame();
  const pulse = (Math.sin(f / 6) * 0.5 + 0.5) * prog(f, 230, 20);
  const fvX = 340; const fdX = 1260; const fW = 320; const fY = 430;
  const rows5 = (a: string, b: string, c: string) => [{text: a, tag: 'FK'}, {text: b, tag: 'FK'}, {text: c, tag: 'FK'}, {text: 'cantidad'}, {text: 'monto'}];
  return (
    <Scene f={f} dur={DUR.galaxy}>
      <Title text="Esquema galaxia (fact constellation)" sub="Varias tablas de hechos que comparten dimensiones" p={prog(f, 0, 20)} />
      {/* estrella 1 */}
      <Table x={fvX} y={fY} w={fW} title="FACT_VENTAS" color={C.orange} p={prog(f, 15, 25)} rows={rows5('id_cliente', 'id_producto', 'id_fecha')} />
      <Table x={30} y={500} w={250} title="DIM_CLIENTE" color={C.blue} p={prog(f, 30, 25)} rows={[{text: 'id_cliente', tag: 'PK'}, {text: 'nombre'}, {text: 'ciudad'}]} />
      <Link a={[280, 600]} b={[fvX, 600]} aKind="one" bKind="many" p={prog(f, 55, 20)} color={C.blue} />
      {/* dimensiones compartidas */}
      <Table x={760} y={190} w={400} title="DIM_PRODUCTO" color={C.green} p={prog(f, 40, 25)} glow={pulse}
        rows={[{text: 'id_producto', tag: 'PK'}, {text: 'nombre'}, {text: 'categoría'}]} />
      <Table x={760} y={720} w={400} title="DIM_TIEMPO" color={C.purple} p={prog(f, 50, 25)} glow={pulse}
        rows={[{text: 'id_fecha', tag: 'PK'}, {text: 'mes'}, {text: 'año'}]} />
      <Link a={[760, 300]} b={[fvX + fW, 500]} aKind="one" bKind="many" p={prog(f, 70, 30)} color={C.green} />
      <Link a={[760, 830]} b={[fvX + fW, 610]} aKind="one" bKind="many" p={prog(f, 75, 30)} color={C.purple} />
      {/* estrella 2 */}
      <Table x={fdX} y={fY} w={fW} title="FACT_DEVOLUCIONES" color={C.pink} p={prog(f, 130, 25)}
        rows={[{text: 'id_motivo', tag: 'FK'}, {text: 'id_producto', tag: 'FK'}, {text: 'id_fecha', tag: 'FK'}, {text: 'unidades'}, {text: 'reembolso'}]} />
      <Table x={1640} y={500} w={250} title="DIM_MOTIVO" color={C.blue} p={prog(f, 140, 25)} rows={[{text: 'id_motivo', tag: 'PK'}, {text: 'descripción'}, {text: 'tipo'}]} />
      <Link a={[1640, 600]} b={[fdX + fW, 600]} aKind="one" bKind="many" p={prog(f, 160, 20)} color={C.blue} />
      <Link a={[1160, 300]} b={[fdX, 500]} aKind="one" bKind="many" p={prog(f, 165, 30)} color={C.green} />
      <Link a={[1160, 830]} b={[fdX, 610]} aKind="one" bKind="many" p={prog(f, 170, 30)} color={C.purple} />
      <Caption p={prog(f, 215, 25)} lines={['Dimensiones conformadas: PRODUCTO y TIEMPO se comparten entre hechos', 'Permiten cruzar procesos distintos (ventas vs. devoluciones) con las mismas definiciones']} y={940} />
      <Caption p={prog(f, 310, 25)} lines={['Galaxia = varias estrellas conectadas por sus dimensiones comunes']} y={1040} color={C.orange} />
    </Scene>
  );
};

/* ---------- Resumen ---------- */
export const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const cards = [
    {t: 'Cardinalidades', c: C.blue, l: ['1:1 → FK única', '1:N → FK en el lado "muchos"', 'N:M → tabla puente']},
    {t: 'Estrella', c: C.orange, l: ['1 tabla de hechos', 'N dimensiones', 'Simple y rápido para BI']},
    {t: 'Galaxia', c: C.pink, l: ['N tablas de hechos', 'Dimensiones conformadas', 'Varios procesos de negocio']},
  ];
  return (
    <Scene f={f} dur={DUR.outro}>
      <Title text="Resumen" p={prog(f, 0, 20)} />
      {cards.map((c, i) => {
        const p = prog(f, 20 + i * 20, 25);
        const x = 130 + i * 580;
        return (
          <g key={c.t} opacity={p} transform={`translate(${x},${280 + (1 - p) * 30})`} fontFamily={FONT}>
            <rect width={520} height={420} rx={20} fill={C.panel} stroke={c.c} strokeWidth={3} />
            <text x={260} y={80} textAnchor="middle" fontSize={44} fontWeight={800} fill={c.c}>{c.t}</text>
            {c.l.map((t, j) => <text key={j} x={40} y={170 + j * 70} fontSize={30} fill={C.text}>• {t}</text>)}
          </g>
        );
      })}
      <Caption p={prog(f, 100, 25)} lines={['Primero entiende las cardinalidades; después elige la forma del modelo analítico']} y={850} />
    </Scene>
  );
};
