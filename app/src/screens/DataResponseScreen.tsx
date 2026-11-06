import { ReactNode } from 'react';
import { View, Text, ScrollView, StyleSheet, useWindowDimensions, RefreshControl} from 'react-native';
import { useDataResponse } from '../hooks/useDataReponse';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import { appTheme } from '../theme/appTheme';

const C = {
  fondo: '#0f172a',
  tarjeta: '#1e293b',
  borde: '#334155',
  texto: '#f1f5f9',
  suave: '#94a3b8',
  frio: '#38bdf8',
  calor: '#f87171',
  top: '#fb923c',
  verde: '#34d399', 
  morado: '#a78bfa',
};

export const DataResponseScreen = () => {
  const { isLoading, data, loadData } = useDataResponse();

  type Fecha = Date | string;
  type Punto = { value: number, label: string };

  const hora = (f: Fecha) => {
    const d = new Date(f);
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;
  }

  const dia = (f: Fecha) => {
    const d = new Date(f);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  }

  const estiloEjes = {
    xAxisLabelTextStyle: { color: C.suave, fontSize: 10 }, 
    yAxisTextStyle: { color: C.suave, fontSize: 10 },
    xAxisColor: C.borde,
    yAxisColor: C.borde,
    rulesColor: C.borde,
    noOfSections: 4,
    isAnimated: true,
  };

  const Tarjeta = ({ titulo, subtitulo, children }: {
    titulo: string;
    subtitulo: string;
    children: ReactNode;
  }) => {
    return (
      <View
        style={ style.tarjeta }
      >
        <Text
          style={ style.titulo }
        >
          { titulo }
        </Text>
        <Text
          style={ style.sub }
        >
          { subtitulo }
        </Text>
        <View
          style={{ marginTop: 16 }}
        >
          { children }
        </View>
      </View>
    );
  }

  const Stat = ({ label, valor, color }: {
    label: string;
    valor: number;
    color: string;
  }) => {
    return ( 
      <View
        style={{
          ...style.stat,
          borderTopColor: color
        }}
      >
        <Text
          style={ style.sub }
        >
          { label }
        </Text>
        <Text
          style={{
            ...style.statValor,
            backgroundColor: color
          }}
        >
          { Number(valor).toFixed(1) } C
        </Text>
      </View>
    );
  }

  const GraficoLinea = ({ datos, color }: { datos: Punto[]; color: string }) => {

    const { width } = useWindowDimensions();

    return (
      <LineChart
        {...estiloEjes}
        data={datos}
        color={color}
        width={width - 122}
        adjustToWidth
        curved              
        areaChart           
        thickness={3} 
        startFillColor={color}      
        endFillColor={C.tarjeta}
        startOpacity={0.4}
        endOpacity={0.02}
        dataPointsColor={color}
        dataPointsRadius={3}
      />
    );
  };

  if(!data){
    return( 
      <View
        style={ appTheme.container }
      >
        <Text
          style={ appTheme.text }
        >
          Cargando...
        </Text>
      </View>
    );
  }

  const { total, estadisticas }= data;

  const temperatura = data.ultimasHoras.map(a => ({
    value: Number(a.temperatura_celcius),
    label: hora(a.fecha),
  }));

  const distancia = data.alertas.map(a => ({
    value: Number(a.distancia_cm),
    label: hora(a.fecha),
  }));

  const diasFrios = data.diasFrios.map(d => ({
    value: Number(d.promedio),
    label: dia(d.dia),
  }));

  const diasCalurosos = data.diasCalurosos.map(d => ({
    value: Number(d.promedio),
    label: dia(d.dia),
  }));

  const top = data.topTemperaturas.map(a => ({
    value: Number(a.temperatura_celcius),
    label: hora(a.fecha),
  }));

  const lecturasPorDia = [
    { value: data.hoy.length, color: C.verde, label: 'Hoy' },
    { value: data.ayer.length, color: C.top, label: 'Ayer' },
    { value: data.anteayer.length, color: C.morado, label: 'Antier' },
  ];

  return(
    <ScrollView
      scrollEnabled={ true }
      style={ style.pantalla }
      contentContainerStyle={{
        flexGrow: 1,
        padding: 20
      }}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={loadData}
          tintColor={C.frio}
          colors={[ C.frio ]}
          progressBackgroundColor={ C.tarjeta }
        />
      }
    >
      <View>
        <Text style={style.header}>Monitor del sensor</Text>
        <Text style={style.sub}>{total} lecturas registradas</Text>
      </View>

      <View style={style.fila}>
        <Stat label="Promedio" valor={estadisticas.temp_promedio} color={C.verde} />
        <Stat label="Mínima" valor={estadisticas.temp_minimo} color={C.frio} />
        <Stat label="Máxima" valor={estadisticas.temp_maxima} color={C.calor} />
      </View>

      <Tarjeta titulo="Temperatura" subtitulo="Últimas horas (°C)">
        <GraficoLinea datos={temperatura} color={C.calor} />
      </Tarjeta>

      <Tarjeta
        titulo="Distancia"
        subtitulo={`Alertas · promedio ${Number(estadisticas.dist_promedio).toFixed(1)} cm`}
      >
        <GraficoLinea datos={distancia} color={C.verde} />
      </Tarjeta>
    </ScrollView>
  );
}

const style = StyleSheet.create({
  pantalla: { flex:1, backgroundColor: C.fondo },
  centro: { justifyContent: 'center', alignItems: 'center' },
  header: { color: C.texto, fontSize: 13 },
  sub: { color: C.texto, fontSize: 26, fontWeight: "bold" },
  fila: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1, backgroundColor: C.tarjeta, borderRadius: 12, borderTopWidth: 3, padding: 12 },
  statValor: { fontSize: 20, fontWeight: 'bold', marginTop: 4 },
  tarjeta: {
    backgroundColor: C.tarjeta,
    borderColor: C.borde,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 16
  },
  titulo: { color: C.texto, fontSize: 17, fontWeight: 'bold' },
  leyenda: { flexDirection: 'row', textAlign: 'center', gap: 6 },
  punto: { width: 10, height: 10, borderRadius: 5 }
});
