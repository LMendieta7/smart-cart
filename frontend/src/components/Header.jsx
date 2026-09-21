import AppBar from "@mui/material/AppBar";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";
import Box from "@mui/material/Box";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from "@mui/icons-material/AccountCircle";


function Header({ checkedCount, totalItemsCount, estimatedTotal }) {
  return (
    <AppBar component="header" position="sticky" sx={{bgcolor:"darkgreen"}}>
        <Toolbar>
            <IconButton color="inherit" edge="start" sx={{ mr: 2 }} aria-label="Open menu">
                <MenuIcon/>
            </IconButton>
            <ShoppingCartIcon fontSize="small" sx={{mr: 0.8}}/>
            <Typography component="h1" variant="h6" sx={{ flexGrow: 1 }}>
                SmartCart
            </Typography>
            <Box
                sx={{
                ml: "auto",
                mr: 1,
                display: "flex",
                alignItems: "center",
                gap: 1.2,
                px: 2,
                py: 0.8,
                borderRadius: "14px",
                backgroundColor: "rgba(255, 255, 255, 0.10)",
            }}
            >
            {estimatedTotal != null && (
              <>
            <Typography sx={{fontWeight: 700, 
                            fontSize: "0.95rem",
                            whiteSpace: "nowrap",
                        }}
            >
                {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(estimatedTotal))}
            </Typography>
            <Box
                component="span"
                sx={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    bgcolor: "currentColor",
                    opacity: 0.65,
                    flexShrink: 0,
                }}
            />
              </>
            )}
            <Typography sx={{fontWeight: 700,
                            fontSize: "0.95rem",
                            whiteSpace: "nowrap",                      
                        }}
            >
                {checkedCount}
                <Box component="span" sx={{
                                    mx: 0.25,
                                    color: "rgba(255, 255, 255, 0.71)",
                                }}
                >/
                </Box>
                {totalItemsCount}
            </Typography>
            </Box>
            
            <IconButton color="inherit" edge="end" aria-label="Open user profile">
                <AccountCircleIcon />
            </IconButton>
        </Toolbar>
    </AppBar>    
  
  );
}

export default Header;
