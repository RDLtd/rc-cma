import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  localStorage: Storage;
  sessionStorage: Storage;

  constructor() {
    this.localStorage = window.localStorage;
    this.sessionStorage = window.sessionStorage;
  }

  get(key: string): any {
    if (this.isLocalStorageSupported) {
      // @ts-ignore
      return JSON.parse(this.localStorage.getItem(key));
    }
    return null;
  }

  getSession(key: string): any {
    if (this.isSessionStorageSupported) {
      // @ts-ignore
      return JSON.parse(this.sessionStorage.getItem(key));
    }
    return null;
  }

  set(key: string, value: any): boolean {
    if (this.isLocalStorageSupported) {
      this.localStorage.setItem(key, JSON.stringify(value));
      return true;
    }
    return false;
  }

  setSession(key: string, value: any): boolean {
    if (this.isSessionStorageSupported) {
      this.sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    }
    return false;
  }

  remove(key: string): boolean {
    if (this.isLocalStorageSupported) {
      this.localStorage.removeItem(key);
      return true;
    }
    return false;
  }

  removeSession(key: string): boolean {
    if (this.isSessionStorageSupported) {
      this.sessionStorage.removeItem(key);
      return true;
    }
    return false;
  }

  get isLocalStorageSupported(): boolean {
    return !!this.localStorage;
  }

  get isSessionStorageSupported(): boolean {
    return !!this.sessionStorage;
  }
}

