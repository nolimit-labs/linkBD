import { colors } from './logger.js';

export interface MenuItem {
  label: string;
  icon: string;
  action: string;
  description: string;
}

// Arrow key navigation
export class MenuNavigator {
  private selectedIndex = 0;

  constructor(private menuItems: MenuItem[], private title: string) {}

  showMenu(): void {
    console.clear();
    console.log(`${colors.bright}${colors.cyan}${this.title}${colors.reset}\n`);
    console.log(`${colors.dim}Use ↑/↓ arrow keys to navigate, Enter to select${colors.reset}\n`);

    this.menuItems.forEach((item, index) => {
      const isSelected = index === this.selectedIndex;
      const prefix = isSelected ? `${colors.inverse} ▶ ` : '   ';
      const suffix = isSelected ? ` ${colors.reset}` : '';
      const icon = `${item.icon} `;
      const label = isSelected ? `${colors.bright}${item.label}${colors.reset}` : item.label;
      const desc = isSelected ? ` ${colors.dim}${item.description}${colors.reset}` : '';
      
      console.log(`${prefix}${icon}${label}${suffix}${desc}`);
    });
  }

  async getSelection(): Promise<string> {
    return new Promise((resolve) => {
      const stdin = process.stdin;
      stdin.setRawMode(true);
      stdin.resume();
      stdin.setEncoding('utf8');

      const onKeyPress = (key: string) => {
        if (key === '\u0003') { // Ctrl+C
          process.exit(0);
        }

        if (key === '\r' || key === '\n') { // Enter
          stdin.setRawMode(false);
          stdin.removeListener('data', onKeyPress);
          resolve(this.menuItems[this.selectedIndex].action);
          return;
        }

        if (key === '\u001b[A') { // Up arrow
          this.selectedIndex = this.selectedIndex > 0 ? this.selectedIndex - 1 : this.menuItems.length - 1;
          this.showMenu();
        }

        if (key === '\u001b[B') { // Down arrow
          this.selectedIndex = this.selectedIndex < this.menuItems.length - 1 ? this.selectedIndex + 1 : 0;
          this.showMenu();
        }
      };

      stdin.on('data', onKeyPress);
      this.showMenu();
    });
  }
}

// Confirmation prompt with arrow keys
export async function confirm(message: string): Promise<boolean> {
  const options = [
    { label: 'No', value: false, icon: '❌' },
    { label: 'Yes', value: true, icon: '✅' }
  ];
  
  let selectedIndex = 0;

  const showConfirmMenu = () => {
    console.clear();
    console.log(`${colors.yellow}⚠️  ${message}${colors.reset}\n`);
    console.log(`${colors.dim}Use ↑/↓ arrow keys to navigate, Enter to select${colors.reset}\n`);

    options.forEach((option, index) => {
      const isSelected = index === selectedIndex;
      const prefix = isSelected ? `${colors.inverse} ▶ ` : '   ';
      const suffix = isSelected ? ` ${colors.reset}` : '';
      const icon = `${option.icon} `;
      const label = isSelected ? `${colors.bright}${option.label}${colors.reset}` : option.label;
      
      console.log(`${prefix}${icon}${label}${suffix}`);
    });
  };

  return new Promise((resolve) => {
    const stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    const onKeyPress = (key: string) => {
      if (key === '\u0003') { // Ctrl+C
        process.exit(0);
      }

      if (key === '\r' || key === '\n') { // Enter
        stdin.setRawMode(false);
        stdin.removeListener('data', onKeyPress);
        resolve(options[selectedIndex].value);
        return;
      }

      if (key === '\u001b[A') { // Up arrow
        selectedIndex = selectedIndex > 0 ? selectedIndex - 1 : options.length - 1;
        showConfirmMenu();
      }

      if (key === '\u001b[B') { // Down arrow
        selectedIndex = selectedIndex < options.length - 1 ? selectedIndex + 1 : 0;
        showConfirmMenu();
      }
    };

    stdin.on('data', onKeyPress);
    showConfirmMenu();
  });
}

// Wait for any key press to continue
export async function waitForKey(message: string = 'Press any key to continue...'): Promise<void> {
  console.log(`\n${colors.dim}${message}${colors.reset}`);
  
  return new Promise((resolve) => {
    const stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    const onKeyPress = () => {
      stdin.setRawMode(false);
      stdin.removeListener('data', onKeyPress);
      resolve();
    };

    stdin.once('data', onKeyPress);
  });
}