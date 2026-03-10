import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { map, Observable, shareReplay } from 'rxjs';

import { AppIconName, iconSources } from './icon.types';

@Injectable({ providedIn: 'root' })
export class IconRegistryService {
  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly cache = new Map<AppIconName, Observable<SafeHtml>>();

  getIcon(name: AppIconName): Observable<SafeHtml> {
    const cached = this.cache.get(name);
    if (cached) {
      return cached;
    }

    const source = iconSources[name];
    const icon$ = this.http.get(source, { responseType: 'text' }).pipe(
      map((svg) => this.sanitizer.bypassSecurityTrustHtml(svg)),
      shareReplay(1),
    );

    this.cache.set(name, icon$);
    return icon$;
  }
}
