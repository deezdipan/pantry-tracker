'use client'
import { Box, Stack, Typography, Button, Modal, TextField, CircularProgress, Snackbar, IconButton, MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import RemoveIcon from '@mui/icons-material/Remove'; // Import the minus icon
import AddIcon from '@mui/icons-material/Add'; // Import the plus icon
import { firestore } from '@/firebase';
import { collection, setDoc, doc, query, getDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%', 
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

export default function Home() {
  const [pantry, setPantry] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('1'); // Default to string '1'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); // State to manage error messages
  const [openSnackbar, setOpenSnackbar] = useState(false); // State to manage snackbar visibility
  const [searchQuery, setSearchQuery] = useState(''); // State to manage search query
  const [selectedItem, setSelectedItem] = useState(''); // State for selected item in the remove modal
  const [modalType, setModalType] = useState(''); // State to manage which modal is open

  const handleOpen = (type) => {
    setModalType(type);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const updatePantry = async () => {
    setLoading(true);
    try {
      const snapshot = query(collection(firestore, 'pantry'));
      const docs = await getDocs(snapshot);
      const pantryList = [];
      docs.forEach((doc) => {
        pantryList.push({ "name": doc.id, ...doc.data() });
      });
      setPantry(pantryList);
    } catch (error) {
      console.error("Error updating pantry: ", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    updatePantry();
  }, []);

  const addItem = async (item, quantity) => {
    if (quantity <= 0 || isNaN(quantity)) {
      setError('Amount not entered');
      setOpenSnackbar(true);
      return;
    }
    try {
      const standardizedItem = item.toLowerCase();
      const docRef = doc(collection(firestore, 'pantry'), standardizedItem);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { count } = docSnap.data();
        await setDoc(docRef, { count: count + quantity });
      } else {
        await setDoc(docRef, { count: quantity });
      }
      await updatePantry();
    } catch (error) {
      console.error("Error adding item: ", error);
    }
  }

  const removeItem = async (item, quantity) => {
    if (quantity <= 0 || isNaN(quantity)) {
      setError('Amount not entered');
      setOpenSnackbar(true);
      return;
    }
    try {
      const standardizedItem = item.toLowerCase();
      const docRef = doc(collection(firestore, 'pantry'), standardizedItem);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { count } = docSnap.data();
        if (quantity >= count) {
          await deleteDoc(docRef);
        } else {
          await setDoc(docRef, { count: count - quantity });
        }
        await updatePantry();
      }
    } catch (error) {
      console.error("Error removing item: ", error);
    }
  }

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    setQuantity(value);
    if (value === '' || parseInt(value, 10) <= 0) {
      setError('Amount not entered');
      setOpenSnackbar(true);
    } else {
      setError('');
      setOpenSnackbar(false); // Close Snackbar if the quantity is valid
    }
  };

  const handleAddItem = () => {
    if (quantity === '' || parseInt(quantity, 10) <= 0) {
      setError('Amount not entered');
      setOpenSnackbar(true);
    } else {
      addItem(itemName, parseInt(quantity, 10)); // Ensure quantity is an integer
      setItemName('');
      setQuantity('1'); // Reset quantity to '1'
      handleClose();
    }
  };

  const handleRemoveItem = () => {
    if (quantity === '' || parseInt(quantity, 10) <= 0) {
      setError('Amount not entered');
      setOpenSnackbar(true);
    } else {
      removeItem(selectedItem, parseInt(quantity, 10)); // Ensure quantity is an integer
      setQuantity('1'); // Reset quantity to '1'
      setSelectedItem(''); // Reset selected item
      handleClose();
    }
  };

  return (
    <Box 
      width="100vw" 
      height="100vh" 
      display={'flex'} 
      justifyContent={'center'} 
      flexDirection={'column'}
      alignItems={'center'}
      gap={2}
    >
      <Typography variant="h1" gutterBottom sx={{ fontSize: '4.0rem' }}>
        Pantry Management
      </Typography>
      <Stack direction="row" spacing={2} marginBottom={2}>
        <TextField 
          label="Search Items"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button variant="contained" onClick={() => handleOpen('add')}>Add New Item</Button>
        <Button variant="contained" onClick={() => handleOpen('remove')}>Remove Item</Button>
      </Stack>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {modalType === 'remove' ? 'Remove Item' : 'Add Item'}
          </Typography>
          {modalType === 'remove' ? (
            <Stack width="100%" direction={'column'} spacing={2}>
              <Stack direction="row" spacing={2} width="100%">
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="select-item-label">Item</InputLabel>
                  <Select
                    labelId="select-item-label"
                    id="select-item"
                    value={selectedItem}
                    onChange={(e) => setSelectedItem(e.target.value)}
                    label="Item"
                  >
                    {pantry.map(({ name }) => (
                      <MenuItem key={name} value={name}>
                        {name.charAt(0).toUpperCase() + name.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="outlined"
                  sx={{ width: 120 }} // Adjust width here
                  onClick={() => setQuantity(pantry.find(item => item.name === selectedItem)?.count || '0')}
                >
                  Select All
                </Button>
              </Stack>
              <TextField
                id="item-quantity"
                label="Quantity"
                type="number"
                variant="outlined"
                fullWidth
                value={quantity}
                onChange={handleQuantityChange}
              />
              <Button
                variant="outlined"
                onClick={handleRemoveItem}
              >
                Remove
              </Button>
            </Stack>
          ) : (
            <Stack width="100%" direction={'column'} spacing={2}>
              <TextField
                id="item-name"
                label="Item"
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <TextField
                id="item-quantity"
                label="Quantity"
                type="number"
                variant="outlined"
                fullWidth
                value={quantity}
                onChange={handleQuantityChange}
              />
              <Button
                variant="outlined"
                onClick={handleAddItem}
              >
                Add
              </Button>
            </Stack>
          )}
        </Box>
      </Modal>

      <Box border={'1px solid #333'}>
        <Box 
          width="800px" 
          height="100px" 
          bgcolor={'#ADD8E6'} 
          display={'flex'} 
          justifyContent={'center'}
          alignItems={'center'}
        >
          <Typography variant={'h2'} color={'#333'} textAlign={'center'}>
            Pantry Items
          </Typography>
        </Box>
        <Stack width="800px" height="300px" spacing={2} overflow={'auto'}>
          {loading ? (
            <CircularProgress />
          ) : (
            pantry
              .filter(({ name }) => name.toLowerCase().includes(searchQuery.toLowerCase())) // Apply search filter
              .map(({ name, count }) => (
                <Box
                  key={name}
                  minHeight="150px" 
                  display={'flex'}
                  justifyContent={'space-between'}
                  paddingX={5}
                  alignItems={'center'}
                  bgcolor={'#f0f0ff0'}
                >
                  <Typography
                    variant={'h3'}
                    color={'#333'}
                    textAlign={'center'}
                    fontWeight={'bold'}
                  >
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </Typography>
                  <Typography variant={'h3'} color={'#333'} textAlign={'center'}>
                    Quantity: {count}
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <IconButton onClick={() => addItem(name, 1)} color="primary">
                      <AddIcon />
                    </IconButton>
                    <IconButton onClick={() => removeItem(name, 1)} color="primary">
                      <RemoveIcon />
                    </IconButton>
                  </Box>
                </Box>
              ))
          )}
        </Stack>
      </Box>

      {/* Snackbar for error messages */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        message={error}
      />
    </Box>
  )
}