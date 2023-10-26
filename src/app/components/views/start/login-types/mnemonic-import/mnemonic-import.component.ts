import { Component, OnInit, HostBinding, Input, OnDestroy, AfterViewInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ImportService } from '../../../../../services/import/import.service';
import { MessageService } from '../../../../../services/message/message.service';
import { StorableWalletType } from '../../../../../interfaces';
import { WalletService } from '../../../../../services/wallet/wallet.service';
import { ExportService } from '../../../../../services/export/export.service';
import { InputValidationService } from '../../../../../services/input-validation/input-validation.service';
import { IndexerService } from '../../../../../services/indexer/indexer.service';
import { OperationService } from '../../../../../services/operation/operation.service';
import { utils, hd, secp256k1 } from '../../../../../libraries/index';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import * as bip39 from 'bip39';
import Big from 'big.js';

interface WalletCandidate {
  pkh: string;
  used?: boolean;
  balance?: string;
}

export enum ChooseWalletState {
  UserDoesNotNeedToChooseWallet,
  UserNeedsToChooseWallet,
  TzktErrorEncountered
}

@Component({
  selector: 'app-mnemonic-import-wallet',
  templateUrl: './mnemonic-import.component.html',
  styleUrls: ['../../../../../../scss/components/views/start/login.component.scss']
})
export class MnemonicImportComponent implements OnInit, AfterViewInit, OnDestroy {
  @HostBinding('class.tacos') showTacos = false;
  @Input('keyStore') keyStore;
  MIN_PWD_LENGTH = 9;
  mnemonic: string;
  email: string;
  password: string;
  passphrase: string;
  pkh: string;
  importOption = 0;
  activePanel = 0;
  wallet: any;
  walletJson: string;
  pwd = '';
  pwd1: string;
  pwd2: string;
  pwdStrength = '';
  Downloaded = false;
  fileName = '';
  showWrongFileUploadMsg: false;
  browser = 'unknown';
  advancedForm = false;
  bip39Wordlist = bip39.wordlists.english;

  // data for seed word wallet import
  storableWalletTypeEnum = StorableWalletType;
  storableWalletType = StorableWalletType.HdWallet;
  chooseWalletStateEnum = ChooseWalletState;
  chooseWalletState = ChooseWalletState.UserDoesNotNeedToChooseWallet;
  legacyCandidate: null | WalletCandidate = null;
  hdCandidate: null | WalletCandidate = null;
  exportedSocialWalletCandidate: null | WalletCandidate = null;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private importService: ImportService,
    private router: Router,
    private messageService: MessageService,
    private walletService: WalletService,
    private exportService: ExportService,
    private inputValidationService: InputValidationService,
    private indexerService: IndexerService,
    private operationService: OperationService
  ) {
    this.subscriptions.add(
      this.router.events.pipe(filter((e) => e instanceof NavigationEnd && e.url.startsWith('/import'))).subscribe(() => {
        const navigation = this.router.getCurrentNavigation();
        this.importOption = navigation.extras?.state?.option ? navigation.extras.state.option : 0;
      })
    );
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    document.documentElement.addEventListener('dragover', this.allowDrop.bind(this));
    document.documentElement.addEventListener('drop', this.handleFileDragAndDrop.bind(this));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  clickPassword(e): void {
    e.target.removeAttribute('readonly');
    e.target.focus();
  }

  blurPassword(e): void {
    e.target.setAttribute('readonly', true);
  }

  async retrieve(): Promise<void> {
    // try to get the PKH from the user provided mnemonic
    if (this.mnemonic) {
      this.mnemonic = this.mnemonic
        .toLowerCase()
        .replace(/(\r\n|\n|\r)/gm, ' ') // replace \n
        .replace(/[^a-z| ]/gm, '') // remove forbidden characters
        .replace(/\s+/g, ' ') // remove extra whitespaces
        .trim();
    }
    if (this.importOption === 2) {
      this.passphrase = this.email + this.password;
    }
    const invalidMnemonic = this.inputValidationService.invalidMnemonic(this.mnemonic);

    if (invalidMnemonic) {
      if (this.importOption === 1) {
        // the mnemonic provided is invalid, but it could also be a shifted mnemonic from
        // an exported social wallets. Convert the shifted mnemonic into a potentially valid
        // mnemonic and see if we can derive the private keys.
        let unshiftedMnemonic = null;
        try {
          unshiftedMnemonic = secp256k1.shiftedMnemonicToMnemonic(this.mnemonic);
        } catch (e) {
          console.log('Failed to convert unshift mnemonic', e);
        }
        if (unshiftedMnemonic) {
          const invalidShiftedMnemonic = this.inputValidationService.invalidMnemonic(unshiftedMnemonic);
          if (invalidShiftedMnemonic) {
            this.messageService.addWarning(invalidMnemonic, 10);
          } else {
            try {
              const spsk = secp256k1.mnemonicToSpsk(unshiftedMnemonic);
              if (secp256k1.validSecretKey(spsk)) {
                if (this.passphrase) {
                  this.messageService.addWarning('Passphrase is not allowed for social wallets', 10);
                } else {
                  const keypair = this.operationService.spPrivKeyToKeyPair(spsk);
                  this.exportedSocialWalletCandidate = { pkh: keypair.pkh };
                  if (this.pkh && this.pkh !== '' && keypair.pkh !== this.pkh) {
                    this.messageService.addWarning(
                      'The provided address does not match the address derived from the seed words. Confirm that the address and passphrase are correct.',
                      5
                    );
                  } else {
                    this.storableWalletType = StorableWalletType.ExportedSocialWallet;
                    this.mnemonic = unshiftedMnemonic;
                    this.activePanel++;
                  }
                }
              } else {
                this.messageService.addWarning(invalidMnemonic, 10);
              }
            } catch (e) {
              console.log('Failed to convert mnemonic to spsk', e);
              this.messageService.addWarning(invalidMnemonic, 10);
            }
          }
        } else {
          this.messageService.addWarning(invalidMnemonic, 10);
        }
      } else {
        this.messageService.addWarning(invalidMnemonic, 10);
      }
    } else if (this.importOption === 2 && !this.inputValidationService.email(this.email)) {
      this.messageService.addWarning('Invalid email!', 10);
    } else if (this.importOption === 2 && !this.password) {
      this.messageService.addWarning('Invalid password!', 10);
    } else if (!this.inputValidationService.passphrase(this.passphrase)) {
      this.messageService.addWarning('Invalid passphrase!', 10);
    } else if (this.pkh && !this.inputValidationService.address(this.pkh)) {
      this.messageService.addWarning('Invalid public key hash!', 10);
    } else if (this.importOption === 1 && this.passphrase && !this.pkh) {
      this.messageService.addWarning('Address is required when importing with passphrase', 10);
    } else {
      // at this point we have validated the majority of the input and we can
      // try to derive the PKH from mnemonic and the passphrase.
      const passphrase = this.passphrase ? this.passphrase : '';
      const legacyWalletAddress = utils.seedToKeyPair(utils.mnemonicToSeed(this.mnemonic, passphrase, false)).pkh;

      if (this.importOption === 1) {
        // seed word import screen

        // from the mnemonic itself we cannot tell if the user prefers the HD or legacy wallet
        // so we collect some data and run some checks
        this.legacyCandidate = { pkh: legacyWalletAddress };
        this.hdCandidate = { pkh: hd.keyPairFromAccountIndex(utils.mnemonicToSeed(this.mnemonic, passphrase, true), 0).pkh };
        if (this.pkh && this.pkh !== '') {
          // the user has provided a PKH and they expect the derivation from the seed words to match one
          if (this.pkh === this.hdCandidate.pkh) {
            this.storableWalletType = StorableWalletType.HdWallet;
            this.hdCandidate.used = true;
            this.legacyCandidate.used = false;
            this.activePanel++;
          } else if (this.pkh === this.legacyCandidate.pkh) {
            this.storableWalletType = StorableWalletType.LegacyWallet;
            this.legacyCandidate.used = true;
            this.hdCandidate.used = false;
            this.activePanel++;
          } else {
            this.messageService.addWarning(
              'The provided address does not match the address derived from the seed words. Confirm that the address and passphrase are correct.',
              5
            );
          }
        } else {
          // these API requests are run in the background and inspected later
          Promise.all([this.indexerService.isUsedAccount(this.legacyCandidate.pkh), this.indexerService.isUsedAccount(this.hdCandidate.pkh)]).then((isUsed) => {
            this.legacyCandidate.used = isUsed[0];
            this.hdCandidate.used = isUsed[1];
            // prefetch balances if both accounts are used
            if (isUsed.every(Boolean)) {
              this.getCandidateBalances();
            } else {
              console.table({ legacy: this.legacyCandidate, hd: this.hdCandidate });
            }
          });
          this.activePanel++;
        }
      } else if (this.importOption === 2 && this.pkh && this.pkh !== legacyWalletAddress) {
        // fundraiser screen if user provided pkh does not match the legacy wallet address
        this.messageService.addWarning('Invalid email or password!', 5);
      } else {
        this.activePanel++;
      }
    }
  }

  getChooseWalletState(): ChooseWalletState {
    if (this.importOption === 2) {
      this.storableWalletType = StorableWalletType.LegacyWallet;
    }
    if (this.importOption === 2 || this.exportedSocialWalletCandidate) {
      return ChooseWalletState.UserDoesNotNeedToChooseWallet;
    }
    if (this.legacyCandidate.used === undefined || this.hdCandidate.used === undefined) {
      // Promises haven't resolved successfully in time (before the user have entered the passwords), fallback on manual wallet type selection
      return ChooseWalletState.TzktErrorEncountered;
    } else if (this.legacyCandidate.used) {
      if (this.hdCandidate.used) {
        return ChooseWalletState.UserNeedsToChooseWallet;
      } else {
        this.storableWalletType = StorableWalletType.LegacyWallet;
      }
    }
    return ChooseWalletState.UserDoesNotNeedToChooseWallet;
  }

  async getCandidateBalances() {
    if (!this.hdCandidate.balance) {
      this.subscriptions.add(
        this.operationService.getBalance(this.hdCandidate.pkh).subscribe((ans) => {
          if (ans.success) {
            this.hdCandidate.balance = Big(ans.payload.balance)
              .div(10 ** 6)
              .toString();
            if (this.legacyCandidate.balance) console.table({ legacy: this.legacyCandidate, hd: this.hdCandidate });
          }
        })
      );
    }
    if (!this.legacyCandidate.balance) {
      this.subscriptions.add(
        this.operationService.getBalance(this.legacyCandidate.pkh).subscribe((ans) => {
          if (ans.success) {
            this.legacyCandidate.balance = Big(ans.payload.balance)
              .div(10 ** 6)
              .toString();
            if (this.hdCandidate.balance) console.table({ legacy: this.legacyCandidate, hd: this.hdCandidate });
          }
        })
      );
    }
  }

  async setPwd(): Promise<void> {
    if (this.validPwd()) {
      const password = this.pwd1;
      this.pwd1 = '';
      this.pwd2 = '';
      await this.messageService.startSpinner('Encrypting wallet...');
      try {
        this.wallet = await this.walletService.createEncryptedWallet(this.mnemonic, password, this.passphrase, this.storableWalletType);
      } finally {
        this.messageService.stopSpinner();
      }
      this.mnemonic = '';
      this.passphrase = '';
      this.email = '';
      this.password = '';
      this.activePanel++;
    }
  }

  async setPwdOrConfirmWalletType() {
    // after the user enters a password and clicks the next button, Kukai
    // decides if they need to choose the wallet or if they can

    this.chooseWalletState = this.getChooseWalletState();

    if (this.chooseWalletState === ChooseWalletState.UserDoesNotNeedToChooseWallet) {
      await this.setPwd();
    } else {
      this.getCandidateBalances();
    }
  }

  async setPwdAfterConfirmingWalletType(): Promise<void> {
    await this.setPwd();

    // clean up
    this.storableWalletType = StorableWalletType.HdWallet;
    this.legacyCandidate = null;
    this.hdCandidate = null;
    this.exportedSocialWalletCandidate = null;
  }

  validPwd(): boolean {
    if (!this.inputValidationService.password(this.pwd1)) {
      this.messageService.addWarning('Password is too weak!', 10);
      return false;
    } else if (this.pwd1 !== this.pwd2) {
      this.messageService.addWarning("Passwords don't match!", 10);
      return false;
    } else {
      return true;
    }
  }
  calcStrength(): void {
    this.pwdStrength = this.inputValidationService.passwordStrengthDisplay(this.pwd1);
  }
  export(): string {
    return JSON.stringify(this.wallet.data);
  }
  showPkh(): string {
    return this.wallet.pkh;
  }
  download(): void {
    this.exportService.downloadWallet(this.wallet.data);
    this.Downloaded = true;
  }
  async done(): Promise<void> {
    await this.messageService.startSpinner('Loading wallet...');
    try {
      await this.importService.importWalletFromObject(this.wallet.data, this.wallet.seed);
    } catch (e) {
      this.messageService.addError('ImportError: ' + e?.message);
      throw e;
    } finally {
      this.messageService.stopSpinner();
    }
    this.wallet = null;
    this.router.navigate([`/account/`]);
    this.messageService.addSuccess('Your new wallet is now set up and ready!');
  }
  /* Keystore handling */
  importPreCheck(keyFile: string): void {
    this.typeCheckFile(keyFile);
    if (this.importService.pwdRequired(keyFile)) {
      this.walletJson = keyFile;
    } else {
      throw new Error('Unsupported wallet file');
    }
  }
  typeCheckFile(keyFile: string): void {
    const obj = JSON.parse(keyFile);
    // Required
    try {
      if (typeof obj.provider !== 'string') {
        throw new Error('provider not a string!');
      }
      if (typeof obj.version !== 'number') {
        throw new Error('version not a number!');
      }
      if (typeof obj.walletType !== 'number') {
        throw new Error('walletType not a number!');
      }
      // Optional
      if (obj.encryptedSeed && typeof obj.encryptedSeed !== 'string') {
        throw new Error('encryptedSeed not a string!');
      }
      if (obj.pkh && typeof obj.pkh !== 'string') {
        throw new Error('pkh not a string!');
      }
      if (obj.iv && typeof obj.iv !== 'string') {
        throw new Error('iv not a string!');
      }
      if (obj.pk && typeof obj.pk !== 'string') {
        throw new Error('pk not a string!');
      }
      if (obj.encryptedEntropy && typeof obj.encryptedEntropy !== 'string') {
        throw new Error('encryptedEntropy not a string!');
      }
    } catch (e) {
      this.messageService.addError(e);
      throw e;
    }
  }
  async checkImportPwd(): Promise<void> {
    if (!this.walletJson) {
      this.messageService.addWarning('No keystore file imported', 5);
    } else if (this.pwd) {
      await this.messageService.startSpinner('Importing wallet...');
      try {
        await this.import(this.walletJson, this.pwd);
        this.pwd = '';
      } finally {
        this.messageService.stopSpinner();
      }
    } else {
      this.messageService.addWarning('No password provided', 5);
    }
  }
  async import(keyFile: string, pwd: string): Promise<void> {
    this.typeCheckFile(keyFile);
    await this.importService
      .importWalletFromJson(keyFile, pwd)
      .then((success: boolean) => {
        if (success) {
          this.router.navigate(['/account/']);
        } else {
          console.log(success);
          this.messageService.addError('Something went wrong');
        }
      })
      .catch((e) => {
        this.messageService.addError(e);
        this.walletService.clearWallet();
        this.messageService.stopSpinner();
      });
  }
  allowDrop(e): void {
    e.stopPropagation();
    e.preventDefault();
  }
  handleFileDragAndDrop(e): void {
    e.preventDefault();
    this.handleFileInput(e.dataTransfer.files);
  }
  handleFileInput(files: FileList): boolean {
    let fileToUpload = files.item(0);
    if (!fileToUpload) {
      return false;
    } else if (!this.validateFile(fileToUpload.name)) {
      this.messageService.add('Selected file format is not supported');

      console.log('Selected file format is not supported');
      fileToUpload = null;
      this.walletJson = null;
      return false;
    } else {
      const reader = new FileReader();
      reader.readAsText(fileToUpload);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          try {
            this.importPreCheck(reader.result);
          } catch (e) {
            this.messageService.addError(e, 5);
            this.walletJson = null;
          }
          if (this.walletJson) {
            this.fileName = fileToUpload.name;
          }
        } else {
          this.walletJson = null;
          throw new Error('Not a string import');
        }
      };
    }
  }
  validateFile(name: string): boolean {
    const ext = name.substring(name.lastIndexOf('.') + 1);
    if (ext.toLowerCase() === 'tez' || ext.toLowerCase() === 'json') {
      return true;
    } else {
      return false;
    }
  }
  seedWordKeydown(e): boolean {
    if (
      !((e.keyCode >= 65 && e.keyCode <= 90) || [8, 9, 13, 32, 37, 38, 39, 40, 46].includes(e.keyCode)) ||
      (e.keyCode === 32 &&
        e.target.value?.slice(-1) === ' ' &&
        e.target?.selectionStart === e.target?.selectionEnd &&
        e.target?.selectionStart === e.target?.value.length)
    ) {
      return false;
    }

    let word = '';
    let words = [];
    let wordPos = -1;
    let charPos = -1;
    if (e.metaKey === false && e.ctrlKey === false && e.keyCode >= 65 && e.keyCode <= 90) {
      const first = e.target.value.slice(0, e.target.selectionStart) + (e.target.selectionStart === e.target.selectionEnd ? e.key : '');
      const second = e.target.value.slice(e.target.selectionStart);
      const firstSplit = first.split(' ');
      words = (first + second).split(' ');
      wordPos = firstSplit.length - 1;
      word = words[wordPos];
      let n = -1;
      firstSplit.pop();
      firstSplit.forEach((item) => {
        n += item.length;
        n++;
      });
      charPos = e.target.selectionStart - 1 - n;
    } else {
      words = e.target.value.split(' ');
    }
    if (e.metaKey === false && e.ctrlKey === false && e.keyCode >= 65 && e.keyCode <= 90) {
      if (e.target.selectionStart !== e.target.selectionEnd) {
        if (e.target.value[e.target.selectionStart] === e.key) {
          const selection = e.target.value.slice(e.target.selectionStart, e.target.selectionEnd);
          if (selection.includes(' ')) {
            return true;
          }
          ++e.target.selectionStart;
          if (e.target.selectionStart === e.target.selectionEnd && words.length < 24) {
            e.target.value = e.target.value.slice(0, e.target.selectionStart) + ' ' + e.target.value.slice(e.target.selectionStart);
            this.mnemonic = e.target.value;
          }
          e.target.setAttribute('data-selection-start', e.target.selectionStart);
          e.target.setAttribute('data-selection-end', e.target.selectionEnd);
          return false;
        } else {
          return true;
        }
      }
      if (word) {
        const r = this.bip39Wordlist.filter((w) => w.startsWith(word));
        // only suggest word if added char is in the end of current word
        if (r.length === 1 && (e.target.selectionEnd !== e.target.selectionStart || charPos + 1 === word.length)) {
          words = words.map((w) => (w === word ? r[0] : w));
          const offset = r[0].length - word.length;
          let selStart = e.target.selectionStart;
          e.target.value = words.join(' ');
          if (offset === 0 && words.length < 24 && wordPos === words.length - 1) {
            e.target.value = e.target.value + ' ';
            selStart++;
          }
          this.mnemonic = e.target.value;
          e.target.selectionStart = selStart + 1;
          e.target.selectionEnd = e.target.selectionStart + offset;
          e.target.setAttribute('data-selection-start', e.target.selectionStart);
          e.target.setAttribute('data-selection-end', e.target.selectionEnd);
          return false;
        }
      }
    } else if (
      [9, 13, 32].includes(e.keyCode) &&
      e.target.selectionStart !== e.target.selectionEnd &&
      Number(e.target.getAttribute('data-selection-start')) === e.target.selectionStart &&
      Number(e.target.getAttribute('data-selection-end')) === e.target.selectionEnd
    ) {
      let selEnd = e.target.selectionEnd;
      const words = e.target.value?.split(' ');
      if (e.target.value.length === selEnd && words?.length < 24) {
        e.target.value += ' ';
        selEnd += 1;
      }
      this.mnemonic = e.target.value;
      e.target.selectionStart = e.target.selectionEnd = selEnd;
      e.target.setAttribute('data-selection-start', e.target.selectionStart);
      e.target.setAttribute('data-selection-end', e.target.selectionStart);
      return false;
    } else if (e.keyCode === 9) {
      return false;
    } else if (e.keyCode === 8) {
      e.target.setAttribute('data-selection-start', e.target.selectionStart);
      e.target.setAttribute('data-selection-end', e.target.selectionStart);
    }
    return true;
  }

  reset(): void {
    this.advancedForm = false;
  }
}
