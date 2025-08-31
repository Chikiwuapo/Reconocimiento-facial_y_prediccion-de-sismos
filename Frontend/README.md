# Dashboard de Power BI - Frontend

Este proyecto es un dashboard moderno y responsivo inspirado en Microsoft Power BI, construido con React, TypeScript, Vite y Tailwind CSS.

## 🚀 Características

- **Dashboard Completo**: 11 widgets diferentes que muestran métricas de negocio
- **Diseño Responsivo**: Se adapta a diferentes tamaños de pantalla
- **Sidebar Interactiva**: Navegación lateral con opciones de workspace
- **Gráficos Interactivos**: Utiliza Recharts para visualizaciones de datos
- **Tema Moderno**: Diseño limpio y profesional con Tailwind CSS
- **Componentes Modulares**: Arquitectura bien estructurada y reutilizable

## 📊 Widgets Incluidos

1. **Sales Card** - KPI de ventas del mes
2. **Sales Orders Chart** - Gráfico de pastel de órdenes por vendedor
3. **Opportunities Chart** - Gráfico de barras de oportunidades por contacto
4. **Profitability Map** - Mapa mundial de rentabilidad por país
5. **Customer Group Chart** - Gráfico de pastel de ventas por grupo de clientes
6. **Item Sales Chart** - Treemap de participación de ventas de ítems
7. **Sales Profit Chart** - Gráfico de dispersión de ventas vs ganancias
8. **Cash Cycle Chart** - Gráfico de líneas de componentes del ciclo de efectivo
9. **Revenue Expenses Chart** - Gráfico de barras de ingresos y gastos
10. **Trial Balance Table** - Tabla de balance de prueba
11. **Margins Chart** - Gráfico de líneas de márgenes

## 🛠️ Tecnologías Utilizadas

- **React 18** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático para JavaScript
- **Vite** - Herramienta de construcción rápida
- **Tailwind CSS** - Framework de CSS utilitario
- **Recharts** - Biblioteca de gráficos para React
- **Lucide React** - Iconos modernos y ligeros

## 📁 Estructura del Proyecto

```
src/
├── components/
│   └── Dashboard/
│       ├── Dashboard.tsx          # Componente principal
│       ├── Sidebar.tsx            # Barra lateral de navegación
│       ├── Header.tsx             # Encabezado del dashboard
│       ├── DashboardGrid.tsx      # Cuadrícula de widgets
│       ├── DashboardContext.tsx   # Contexto del estado
│       ├── index.ts               # Exportaciones
│       └── Widgets/               # Widgets individuales
│           ├── SalesCard.tsx
│           ├── SalesOrdersChart.tsx
│           ├── OpportunitiesChart.tsx
│           ├── ProfitabilityMap.tsx
│           ├── CustomerGroupChart.tsx
│           ├── ItemSalesChart.tsx
│           ├── SalesProfitChart.tsx
│           ├── CashCycleChart.tsx
│           ├── RevenueExpensesChart.tsx
│           ├── TrialBalanceTable.tsx
│           └── MarginsChart.tsx
├── styles/
│   └── index.css                  # Estilos globales y Tailwind
└── App.tsx                        # Componente raíz
```

## 🚀 Instalación y Uso

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Ejecutar en modo desarrollo:**
   ```bash
   npm run dev
   ```

3. **Construir para producción:**
   ```bash
   npm run build
   ```

4. **Vista previa de la construcción:**
   ```bash
   npm run preview
   ```

## 🎨 Personalización

### Colores
Los colores se pueden personalizar en `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#f0f9ff',
        // ... más variantes
      }
    }
  }
}
```

### Widgets
Cada widget es un componente independiente que se puede modificar o reemplazar fácilmente.

### Datos
Los datos de ejemplo están hardcodeados en cada widget. Para usar datos reales, simplemente reemplaza las constantes con llamadas a APIs.

## 📱 Responsividad

El dashboard es completamente responsivo y se adapta a:
- **Mobile**: 1 columna
- **Tablet**: 2 columnas
- **Desktop**: 3 columnas
- **Large Desktop**: 4 columnas

## 🔧 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Construcción para producción
- `npm run preview` - Vista previa de la construcción
- `npm run lint` - Linting del código
- `npm run type-check` - Verificación de tipos TypeScript

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request para sugerencias o mejoras.
