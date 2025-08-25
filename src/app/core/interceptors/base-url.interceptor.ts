import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../config/environment';

export const baseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith('http')) return next(req);
  return next(req.clone({ url: environment.apiBaseUrl + req.url }));
};
