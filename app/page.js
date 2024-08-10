// Add "use client" at the top to indicate this is a Client Component
'use client';

import { useState, useEffect } from 'react';
import { Box, Modal, Typography, Stack, TextField, Button, Snackbar } from '@mui/material';
import { firestore } from '@/firebase';
import { collection, getDocs, deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const updateInventory = async () => {
    try {
      const inventoryCollection = collection(firestore, 'inventory');
      const snapshot = await getDocs(inventoryCollection);
      const inventoryList = [];
      snapshot.forEach((doc) => {
        inventoryList.push({
          name: doc.id,
          ...doc.data(),
        });
      });
      setInventory(inventoryList);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setSnackbar({ open: true, message: 'Error fetching inventory', severity: 'error' });
    }
  };

  const removeItem = async (item) => {
    try {
      const docRef = doc(firestore, 'inventory', item);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        if (quantity === 1) {
          await deleteDoc(docRef);
        } else {
          await setDoc(docRef, { quantity: quantity - 1 });
        }
        setSnackbar({ open: true, message: 'Item removed successfully', severity: 'success' });
      }
      await updateInventory();
    } catch (error) {
      console.error('Error removing item:', error);
      setSnackbar({ open: true, message: 'Error removing item', severity: 'error' });
    }
  };

  const addItem = async (item) => {
    if (!item.trim()) {
      setSnackbar({ open: true, message: 'Item name cannot be empty', severity: 'warning' });
      return;
    }
    try {
      const docRef = doc(firestore, 'inventory', item);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        await setDoc(docRef, { quantity: quantity + 1 });
      } else {
        await setDoc(docRef, { quantity: 1 });
      }
      setSnackbar({ open: true, message: 'Item added successfully', severity: 'success' });
      await updateInventory();
    } catch (error) {
      console.error('Error adding item:', error);
      setSnackbar({ open: true, message: 'Error adding item', severity: 'error' });
    }
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box
      
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={2}
    >
      <Snackbar
        open={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        autoHideDuration={3000}
        severity={snackbar.severity}
      />
      <Modal open={open} onClose={handleClose}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width={400}
          bgcolor="white"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: 'translate(-50%,-50%)',
          }}
        >
          <Typography variant="h6">Add Item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName);
                setItemName('');
                handleClose();
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Button variant="contained" onClick={handleOpen}>
        Add New Item
      </Button>
      <Box
        border="1px solid #333"
        width="800px"
        height="100px"
        bgcolor="#ADD8E6"
        alignItems="center"
        justifyContent="center"
        display="flex"
      >
        <Typography variant="h2" color="#333">
          Pantry Items
        </Typography>
      </Box>
      <Stack width="800px" height="300px" spacing={2} overflow="auto" border= "1px solid #333">
        {inventory.map(({ name, quantity }) => (
          <Box
            key={name}
            width="100%"
            minHeight="150px"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            bgcolor="#f0f0f0"
            padding={5}
          >
            <Typography variant="h3" color="#333" textAlign="center">
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </Typography>
            <Typography variant="h3" color="#333" textAlign="center" sx={{ fontSize: '20px' }}>
              Quantity: {quantity}
            </Typography>
            <Button variant="contained" onClick={() => addItem(name)}>
              Add
            </Button>
            <Button variant="outlined" color="error" onClick={() => removeItem(name)}>
              Remove
            </Button>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
