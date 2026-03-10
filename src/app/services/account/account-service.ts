import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AccountSettingsCreate} from '../../shared/models/account-settings.models';
import {Observable} from 'rxjs';

@Injectable()
export class AccountService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000';
  private readonly accountUrl = `${this.baseUrl}/account-settings`;

  getAccountDetails(id: string) {
    return this.http.get(`${this.accountUrl}/${id}`);
  }

  update(id: string, payload: AccountSettingsCreate) {
    return this.http.put(`${this.accountUrl}/${id}`, payload);
  }

  create(payload: AccountSettingsCreate) {
    return this.http.post(`${this.accountUrl}`, payload);
  }
}
