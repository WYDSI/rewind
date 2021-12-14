import { RewindLogo } from "./RewindLogo";
import { Badge, Box, Divider, IconButton, Stack, Tooltip } from "@mui/material";
import { Home } from "@mui/icons-material";
import { FaMicroscope } from "react-icons/fa";
import React from "react";
import { useAppDispatch, useAppSelector } from "./hooks/hooks";
import UpdateIcon from "@mui/icons-material/Update";
import { setUpdateModalOpen } from "./update/slice";
import { useMatch, useNavigate, useResolvedPath } from "react-router-dom";

const tooltipPosition = {
  anchorOrigin: {
    vertical: "center",
    horizontal: "right",
  },
  transformOrigin: {
    vertical: "center",
    horizontal: "left",
  },
};

function SidebarButton({ to, icon, tooltip }: { to: string; tooltip: string; icon: React.ReactElement }) {
  const resolved = useResolvedPath(to);
  const match = useMatch({ path: resolved.pathname, end: true });
  const navigate = useNavigate();
  const handleClick = () => navigate(to);

  return (
    <Tooltip title={tooltip} placement={"right"}>
      <IconButton color={match ? "primary" : "default"} onClick={handleClick}>
        {icon}
      </IconButton>
    </Tooltip>
  );
}

export function LeftMenuSidebar() {
  const dispatch = useAppDispatch();

  const { newVersion } = useAppSelector((state) => state.updater);

  const openUpdateModal = () => dispatch(setUpdateModalOpen(true));
  // const handleLinkClick = (to: string) => () => dispatch(push(to));
  const navigate = useNavigate();
  const handleLinkClick = (to: string) => () => navigate(to);

  return (
    <Stack
      sx={{
        width: (theme) => theme.spacing(10),
        paddingBottom: 2,
      }}
      gap={1}
      p={1}
      alignItems={"center"}
      component={"nav"}
    >
      <Box onClick={handleLinkClick("/home")} sx={{ cursor: "pointer" }}>
        <RewindLogo />
      </Box>
      <Divider orientation={"horizontal"} sx={{ borderWidth: 1, width: "80%" }} />
      <SidebarButton to={"/home"} tooltip={"Overview"} icon={<Home />} />
      <SidebarButton to={"/analyzer"} tooltip={"Analyzer"} icon={<FaMicroscope height={"0.75em"} />} />
      {/*Nothing*/}
      <Box flexGrow={1} />
      <Tooltip title={newVersion === null ? "No updates" : `New version ${newVersion} available!`} placement={"right"}>
        <IconButton onClick={openUpdateModal}>
          <Badge variant={"dot"} color={"error"} invisible={newVersion === null}>
            <UpdateIcon />
          </Badge>
        </IconButton>
      </Tooltip>
    </Stack>
  );
}
