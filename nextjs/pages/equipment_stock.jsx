import { useState, useEffect } from "react";
import { Container, Button, Typography, Stack, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import Swal from 'sweetalert2';

export default function EquipmentStock() {
  const [equipment, setEquipment] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ equipment_name: "", quantity: "", location: "" });
  const [editId, setEditId] = useState(null);

  const fetchEquipment = async () => {
    const res = await fetch("<http://localhost:8000/equipment_stock/>");
    const data = await res.json();
    setEquipment(data);
  };

  useEffect(() => { fetchEquipment(); }, []);

  const handleOpen = (item) => {
    if (item) {
      setForm({
        equipment_name: item.equipment_name,
        quantity: item.quantity,
        location: item.location || ""
      });
      setEditId(item.equipment_id);
    } else {
      setForm({ equipment_name: "", quantity: "", location: "" });
      setEditId(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setForm({ equipment_name: "", quantity: "", location: "" });
    setEditId(null);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const method = editId ? "PUT" : "POST";
      const url = editId ? `http://localhost:8000/equipment_stock/${editId}` : "<http://localhost:8000/equipment_stock/>";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, quantity: parseInt(form.quantity) })
      });
      if (!res.ok) throw new Error("Save failed");
      await fetchEquipment();
      Swal.fire({ title: "Success!", text: "Equipment saved.", icon: "success" });
      handleClose();
    } catch (err) {
      Swal.fire({ title: "Error", text: err.message, icon: "error" });
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:8000/equipment_stock/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      await fetchEquipment();
      Swal.fire({ title: "Deleted!", text: "Equipment deleted.", icon: "success" });
    } catch (err) {
      Swal.fire({ title: "Error", text: err.message, icon: "error" });
    }
  };

  const columns = [
    { field: 'equipment_id', headerName: 'ID', width: 80 },
    { field: 'equipment_name', headerName: 'Equipment Name', width: 200 },
    { field: 'quantity', headerName: 'Quantity', width: 120 },
    { field: 'location', headerName: 'Location', width: 180 },
    { field: 'updated_at', headerName: 'Updated', width: 180 },
    {
      field: 'actions', headerName: 'Actions', width: 180, renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" onClick={() => handleOpen(params.row)}>Edit</Button>
          <Button size="small" color="error" variant="outlined" onClick={() => handleDelete(params.row.equipment_id)}>Delete</Button>
        </Stack>
      )
    }
  ];

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h5" gutterBottom>RAI Equipment Stock — Data Table</Typography>
      <Button variant="contained" color="primary" onClick={() => handleOpen()}>Add Equipment</Button>
      <div style={{ height: 400, width: '100%', marginTop: 16 }}>
        <DataGrid rows={equipment} columns={columns} getRowId={row => row.equipment_id} />
      </div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editId ? "Edit Equipment" : "Add Equipment"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Equipment Name" name="equipment_name" value={form.equipment_name} onChange={handleChange} required />
            <TextField label="Quantity" name="quantity" type="number" value={form.quantity} onChange={handleChange} required />
            <TextField label="Location" name="location" value={form.location} onChange={handleChange} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
