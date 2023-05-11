import { GitHub, MenuRounded } from "@mui/icons-material";
import {
  AppBar,
  Container,
  Divider,
  IconButton,
  Link as MuiLink,
  ListItemIcon,
  Menu,
  MenuItem,
  SxProps,
  Toolbar,
} from "@mui/material";
import { Box } from "@mui/system";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { CONTACTS } from "constants/contacts";
import Link from "next/link";
import { useState } from "react";
import { chainToSupportedChainId } from "utils/chains";
import { useAccount, useNetwork } from "wagmi";
import { crossbell } from "wagmi/chains";

/**
 * Component with navigation.
 */
export default function Navigation() {
  return (
    <AppBar
      color="inherit"
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Logo sx={{ flexGrow: 1 }} />
          <Links sx={{ ml: 1 }} />
        </Toolbar>
      </Container>
    </AppBar>
  );
}

function Logo(props: { sx?: SxProps }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", ...props.sx }}>
      <Link href="/" passHref legacyBehavior>
        <MuiLink
          variant="h6"
          color="#000000"
          fontWeight={700}
          display={{ xs: "none", md: "flex" }}
        >
          🏆 Stream Challenges
        </MuiLink>
      </Link>
      <Link href="/" passHref legacyBehavior>
        <MuiLink
          variant="h6"
          color="#000000"
          fontWeight={700}
          display={{ xs: "flex", md: "none" }}
        >
          🏆 SC
        </MuiLink>
      </Link>
    </Box>
  );
}

function Links(props: { sx?: SxProps }) {
  const { chain } = useNetwork();
  const { isConnected, address } = useAccount();

  return (
    <Box sx={{ display: "flex", alignItems: "center", ...props.sx }}>
      {isConnected &&
        (chainToSupportedChainId(chain) === crossbell.id ? (
          <MuiLink
            href="https://crossbell.io/wallet/characters"
            target="_blank"
            fontWeight={700}
            color="inherit"
            display={{ xs: "none", sm: "flex" }}
          >
            Character
          </MuiLink>
        ) : (
          <Link href={`/accounts/${address}`} passHref legacyBehavior>
            <MuiLink
              fontWeight={700}
              color="inherit"
              display={{ xs: "none", sm: "flex" }}
            >
              Account
            </MuiLink>
          </Link>
        ))}
      <Link href="/#challenge" passHref legacyBehavior>
        <MuiLink
          fontWeight={700}
          color="inherit"
          display={{ xs: "none", sm: "flex" }}
          ml={3.5}
        >
          Challenge
        </MuiLink>
      </Link>
      <Link href="/leaderboard" passHref legacyBehavior>
        <MuiLink
          fontWeight={700}
          color="inherit"
          display={{ xs: "none", sm: "flex" }}
          ml={3.5}
        >
          Leaderboard
        </MuiLink>
      </Link>
      <Box ml={3.5}>
        <ConnectButton
          showBalance={false}
          accountStatus="avatar"
          chainStatus="icon"
        />
      </Box>
      <IconButton
        component="a"
        target="_blank"
        href={CONTACTS.github}
        color="inherit"
        sx={{ display: { xs: "none", sm: "flex" }, ml: 2 }}
      >
        <GitHub fontSize="small" />
      </IconButton>
      <NavigationMenu
        displayAccountLink
        displayChallengeLink
        displayLeaderboardLink
        sx={{ display: { xs: "flex", sm: "none" }, ml: 1.5 }}
      />
    </Box>
  );
}

function NavigationMenu(props: {
  displayAccountLink?: boolean;
  displayChallengeLink?: boolean;
  displayLeaderboardLink?: boolean;
  sx?: SxProps;
}) {
  const { isConnected, address } = useAccount();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  function handleClick(event: React.MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget);
  }
  function handleClose() {
    setAnchorEl(null);
  }

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        aria-controls={open ? "navigation-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        sx={{ ...props.sx }}
      >
        <MenuRounded />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        id="navigation-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {props.displayAccountLink && isConnected && (
          <Link href={`/accounts/${address}`} passHref legacyBehavior>
            <MenuItem>Account</MenuItem>
          </Link>
        )}
        {props.displayChallengeLink && (
          <Link href="/#challenge" passHref legacyBehavior>
            <MenuItem>Challenge</MenuItem>
          </Link>
        )}
        {props.displayLeaderboardLink && (
          <Link href="/leaderboard" passHref legacyBehavior>
            <MenuItem>Leaderboard</MenuItem>
          </Link>
        )}
        <Divider />
        <MenuItem component="a" target="_blank" href={CONTACTS.github}>
          <ListItemIcon>
            <GitHub fontSize="small" />
          </ListItemIcon>
          GitHub
        </MenuItem>
      </Menu>
    </>
  );
}
