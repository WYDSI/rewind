import { useAppSelector } from "./hooks/hooks";
import { Route, Routes } from "react-router-dom"; // react-router v4/v5
import { LeftMenuSidebar } from "./LeftMenuSidebar";
import { SplashScreen } from "./splash/SplashScreen";
import { SetupScreen } from "./setup/SetupScreen";
import { HomeScreen } from "./home/HomeScreen";
import { Box, Divider, Stack } from "@mui/material";
import { Analyzer } from "@rewind/feature-replay-viewer";
import { UpdateModal } from "./UpdateModal";

function ConnectedAnalyzer() {
  return <Analyzer />;
}

function ConnectedSplashScreen() {
  const status = useAppSelector((state) => state.backend.status);
  return <SplashScreen status={status} />;
}

function ConnectedSetupScreen() {
  return <SetupScreen />;
}

function NormalView() {
  const { status } = useAppSelector((state) => state.backend);

  if (status !== "READY") {
    return <div>You should not be here</div>;
  }
  return (
    <Stack direction={"row"} sx={{ height: "100vh" }}>
      <LeftMenuSidebar />
      <Divider orientation={"vertical"} />
      <Box sx={{ flexGrow: 1, height: "100%" }}>
        <Routes>
          <Route path={"/home"} element={<HomeScreen />} />
          <Route path={"/analyzer"} element={<ConnectedAnalyzer />} />
        </Routes>
      </Box>
      <UpdateModal />
    </Stack>
  );
}

export function RewindApp() {
  return (
    <Routes>
      <Route path={"/splash"} element={<ConnectedSplashScreen />} />
      <Route path={"/setup"} element={<ConnectedSetupScreen />} />
      <Route path={"/*"} element={<NormalView />} />
    </Routes>
  );
}
