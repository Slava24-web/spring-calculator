import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Slider, Switch, Card, Row, Col, Divider, Typography, Select } from 'antd';
import { materials } from './constants';

const { Title: AntTitle, Text } = Typography;
const { Option } = Select;

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

type CalculationResults = {
    springDeflection: number;
    newClearance: number;
    clearanceChange: number;
    calculatedStiffness?: number;
};

const App: React.FC = () => {
    // Параметры автомобиля
    const [carMass, setCarMass] = useState<number>(1500); // Масса авто
    const [springCount, setSpringCount] = useState<number>(4); // Количество пружин
    const [initialClearance, setInitialClearance] = useState<number>(180); // Начальный клиренс

    // Параметры для расчёта жёсткости
    const [wireDiameter, setWireDiameter] = useState<number>(0); // Толщина прутка
    const [outerDiameter, setOuterDiameter] = useState<number>(0); // Внешний диаметр пружины
    const [springHeight, setSpringHeight] = useState<number>(0); // Высота пружины
    const [selectedMaterial, setSelectedMaterial] = useState<number>(80000); // Плотность материала

    const [results, setResults] = useState<CalculationResults | null>(null);

    // Формула расчёта жёсткости без количества витков
    const calculateSpringStiffness = (): number => {
        const meanDiameter = outerDiameter - wireDiameter;
        // Эмпирическая формула для приблизительного расчёта
        // 10 - эмпирический коэффициент
        return (selectedMaterial * Math.pow(wireDiameter, 4)) / (10 * Math.pow(meanDiameter, 3));
    };

    const calculateClearance = (): void => {
        try {
            const stiffness = calculateSpringStiffness() * 1000;

            const weightForce = carMass * 9.81;
            const forcePerSpring = weightForce / springCount;
            const deflection = forcePerSpring / stiffness;
            const deflectionMm = deflection * 1000;
            const newClearance = initialClearance - deflectionMm;

            setResults({
                springDeflection: deflectionMm,
                newClearance,
                clearanceChange: deflectionMm,
                calculatedStiffness: stiffness / 1000,
            });
        } catch (error) {
            console.error("Calculation error:", error);
            setResults(null);
        }
    };

    useEffect(() => {
        calculateClearance();
    }, [
        carMass,
        springCount,
        initialClearance,
        wireDiameter,
        outerDiameter,
        springHeight,
        selectedMaterial
    ]);

    const chartData = {
        labels: ['Исходный клиренс', 'Новый клиренс'],
        datasets: [{
            label: 'Клиренс (мм)',
            data: [initialClearance, results?.newClearance || initialClearance],
            backgroundColor: [
                'rgba(75, 192, 192, 0.6)',
                'rgba(255, 99, 132, 0.6)'
            ],
            borderColor: [
                'rgba(75, 192, 192, 1)',
                'rgba(255, 99, 132, 1)'
            ],
            borderWidth: 1
        }]
    };

    return (
        <div style={{ padding: '24px' }}>
          <AntTitle level={2} style={{ textAlign: 'center', marginBottom: '24px' }}>
            Калькулятор изменения клиренса
          </AntTitle>
          
          <Row gutter={[16, 16]}>
            <Col span={24} md={12}>
              <Card title="Параметры автомобиля">
                <div style={{ marginBottom: '16px' }}>
                  <Text strong>Масса автомобиля (кг):</Text>
                  <Slider
                    min={20}
                    max={3000}
                    step={5}
                    value={carMass}
                    onChange={setCarMass}
                    tooltip={{ formatter: (value) => `${value} кг` }}
                  />
                  <Text type="secondary">Значение: {carMass} кг</Text>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <Text strong>Количество пружин:</Text>
                  <Select
                    style={{ width: '100%' }}
                    value={springCount}
                    onChange={setSpringCount}
                  >
                    <Option value={2}>2 (передние или задние)</Option>
                    <Option value={4}>4 (все)</Option>
                  </Select>
                </div>
                
                <div>
                  <Text strong>Исходный клиренс (мм):</Text>
                  <Slider
                    min={50}
                    max={300}
                    step={1}
                    value={initialClearance}
                    onChange={setInitialClearance}
                    tooltip={{ formatter: (value) => `${value} мм` }}
                  />
                  <Text type="secondary">Значение: {initialClearance} мм</Text>
                </div>
              </Card>
            </Col>
            
            <Col span={24} md={12}>
              <Card title="Параметры пружин">
                
                  <>
                    <div style={{ marginBottom: '16px' }}>
                      <Text strong>Диаметр проволоки (мм):</Text>
                      <Slider
                        min={1}
                        max={20}
                        step={0.25}
                        value={wireDiameter}
                        onChange={setWireDiameter}
                        tooltip={{ formatter: (value) => `${value} мм` }}
                      />
                      <Text type="secondary">Значение: {wireDiameter} мм</Text>
                    </div>
                    
                    <div style={{ marginBottom: '16px' }}>
                      <Text strong>Внешний диаметр пружины (мм):</Text>
                      <Slider
                        min={wireDiameter + 5}
                        max={200}
                        step={0.25}
                        value={outerDiameter}
                        onChange={setOuterDiameter}
                        tooltip={{ formatter: (value) => `${value} мм` }}
                      />
                      <Text type="secondary">Значение: {outerDiameter} мм</Text>
                    </div>
                    
                    <div style={{ marginBottom: '16px' }}>
                      <Text strong>Высота пружины (мм):</Text>
                      <Slider
                        min={wireDiameter}
                        max={500}
                        step={1}
                        value={springHeight}
                        onChange={setSpringHeight}
                        tooltip={{ formatter: (value) => `${value} мм` }}
                      />
                      <Text type="secondary">Значение: {springHeight} мм</Text>
                    </div>
                    
                    <div>
                      <Text strong>Материал пружины:</Text>
                      <Select
                        style={{ width: '100%' }}
                        value={selectedMaterial}
                        onChange={setSelectedMaterial}
                      >
                        {materials.map((material) => (
                          <Option key={material.value} value={material.value}>
                            {material.name} ({material.value.toLocaleString()} Н/мм²)
                          </Option>
                        ))}
                      </Select>
                    </div>
                  </>
              </Card>
            </Col>
          </Row>
          
          {results && (
            <Card title="Результаты расчёта" style={{ marginTop: '16px' }}>
              <Row gutter={[16, 16]}>
                <Col span={24} md={12}>
                  {
                    results.calculatedStiffness && (
                        <div style={{ marginBottom: '16px' }}>
                        <Text strong>Рассчитанная жёсткость:</Text>
                        <Text style={{ float: 'right' }}>
                            {results.calculatedStiffness.toFixed(2)} Н/мм
                        </Text>
                        </div>
                    )
                  }
                  
                  <div style={{ marginBottom: '16px' }}>
                    <Text strong>Проседание пружины:</Text>
                    <Text style={{ float: 'right' }}>
                      {results.springDeflection.toFixed(1)} мм
                    </Text>
                  </div>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <Text strong>Новый клиренс:</Text>
                    <Text style={{ float: 'right' }}>
                      {results.newClearance.toFixed(1)} мм
                    </Text>
                  </div>
                  
                  <div>
                    <Text strong>Изменение клиренса:</Text>
                    <Text style={{ float: 'right' }}>
                      {results.clearanceChange.toFixed(1)} мм
                    </Text>
                  </div>
                </Col>
                
                <Col span={24} md={12}>
                  <div style={{ height: '300px' }}>
                    <Bar 
                      data={chartData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: 'Клиренс (мм)'
                            }
                          }
                        }
                      }} 
                    />
                  </div>
                </Col>
              </Row>
            </Card>
          )}
        </div>
      );
};

export default App;