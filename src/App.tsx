import AppRoutes from "./routes"
import { TooltipProvider } from "@radix-ui/react-tooltip"

export default function App() {
  return ( 
  <TooltipProvider>
    <AppRoutes /> 
  </TooltipProvider>
  )
}
