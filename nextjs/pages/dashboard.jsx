import { useEffect, useState } from "react";
import { Container, Typography, Grid, Paper, Box } from "@mui/material";
import { BarChart } from '@mui/x-charts/BarChart';

export default function Dashboard() {
  const [summary, setSummary] = useState({ total_items: 0, total_quantity: 0 });
  const [locationData, setLocationData] = useState([]);

  useEffect(() => {
    // 1. Fetch overall summary data
    fetch("http://localhost:8000/equipment_stock/summary")
      .then(res => res.json())
      .then(data => setSummary(data))
      .catch(error => console.error("Error fetching summary:", error));

    // 2. Fetch location summary data for the chart
    fetch("http://localhost:8000/equipment_stock/location_summary")
      .then(res => res.json())
      .then(data => {
        // DEFENSIVE CHECK: Only set locationData if it is an array
        if (Array.isArray(data)) {
          setLocationData(data);
        } else {
          console.error("API returned non-array data for location summary:", data);
        }
      })
      .catch(error => console.error("Error fetching location data:", error));
  }, []);

  // Prepare data for the BarChart, using l.location and l.total (FIXED TYPO)
  const chartData = {
    locations: locationData.map(l => l.location),
    totals: locationData.map(l => l.total),
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h5" gutterBottom>RAI Equipment Stock Dashboard</Typography>
      
      <Grid container spacing={3}>
        
        {/* Total Equipment Items Card */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">Total Equipment Items</Typography>
            <Typography variant="h3" color="primary">{summary.total_items}</Typography>
          </Paper>
        </Grid>

        {/* Total Quantity Card - FIXED CLOSING BRACKET HERE */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">Total Quantity</Typography>
            <Typography variant="h3" color="primary">{summary.total_quantity}</Typography>
          </Paper>
        </Grid>

        {/* Equipment by Location Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Equipment by Location</Typography>
            
            {/* Conditional rendering: Only render the chart if data is available */}
            {locationData.length > 0 ? (
              <BarChart
                xAxis={[
                  { 
                    data: chartData.locations, 
                    scaleType: 'band', 
                    label: 'Location',
                  }
                ]}
                series={[
                  { 
                    data: chartData.totals, 
                    label: 'Total Quantity',
                    color: '#4caf50',
                  }
                ]}
                // Set width to null for responsiveness within the Paper
                width={null} 
                height={350}
                margin={{ top: 30, right: 20, bottom: 60, left: 40 }} 
              />
            ) : (
              // Display a loading message or fallback component
              <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">Loading location chart data...</Typography>
              </Box>
            )}

          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}