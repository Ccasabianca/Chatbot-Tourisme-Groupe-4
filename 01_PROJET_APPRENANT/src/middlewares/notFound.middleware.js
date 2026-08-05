export function notFoundMiddleware(req,res){
  return res.status(404).json({ success:false, error:{ code:"ROUTE_NOT_FOUND", message:"La ressource demandée est introuvable." } });
}
