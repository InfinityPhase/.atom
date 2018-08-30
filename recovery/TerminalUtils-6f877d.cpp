#include "TerminalUtils.h"
#include <Keyboard.h>

const enum OperatingSystem {
  WINDOWS,
  MACOS,
  LINUX
};

const enum DesktopEnv {
  I3,
  GNOME,
  CINNAMON,
  KDE,
  UNITY
};

const enum Shell {
  CMD,
  POWERSHELL,
  BASH
};

// Check value of lock keys
int ledkeys(void) {return int(keyboard_leds);}
bool is_scroll_on(void) {return ((ledkeys() & 4) == 4) ? true : false;}
bool is_caps_on(void)   {return ((ledkeys() & 2) == 2) ? true : false;}
bool is_num_on(void) {return ((ledkeys() & 1) == 1) ? true : false;}

// Waits until we can send keypresses
void setupDelay(){
  bool initialState = is_num_on();
  bool currentState = false;

  while( true ){
    currentState = is_num_on();
    Keyboard.press(KEY_NUM_LOCK);
    delay(200); // Spam it, because why not...
    if( currentState != is_num_on() ){
      // We changed the value of numlock
      break;
    }
  }

  if( initialState != is_num_on() ){
    Keyboard.press(KEY_NUM_LOCK);
  }
  
}

// Undoes any set keys or modifiers
void unpressAll(){
  Keyboard.set_modifier(0);
  Keyboard.set_media(0);
  Keyboard.set_key1(0);
  Keyboard.set_key2(0);
  Keyboard.set_key3(0);
  Keyboard.set_key4(0);
  Keyboard.set_key5(0);
  Keyboard.set_key6(0);
  
  Keyboard.send_now();
}

// Opens a terminal, based on OS and Desktop Enviroment
void openTerm( OperatingSystem os, DesktopEnv de, Shell sh ) {
  switch( os ){
    case OperatingSystem.LINUX: // i3
      switch( de ) {
        case DesktopEnv.I3:
          Keyboard.set_modifier(MODIFIERKEY_RIGHT_GUI);
          Keyboard.send_now();
          Keyboard.press(KEY_ENTER);
        case DesktopEnv.GNOME:
        case DesktopEnv.CINNAMON:
        case DesktopEnv.UNITY:
          Keyboard.set_modifier(MODIFIERKEY_ALT | MODIFIERKEY_CTRL);
          Keyboard.send_now();
          Keyboard.press(KEY_T);
          break;
      }
      break;
    case OperatingSystem.MACOS:
      Keyboard.set_modifier(MODIFIERKEY_RIGHT_GUI);
      Keyboard.send_now();
      Keyboard.press(KEY_SPACE);
      Keyboard.press(KEY_ESC);
      break;
    case OperatingSystem.WINDOWS:
      Keyboard.set_modifier(MODIFIERKEY_RIGHT_GUI);
      Keyboard.send_now();
      Keyboard.press(KEY_R);
      unpressAll();
      
      if( sh == Shell.POWERSHELL ) { 
        Keyboard.println("powershell");
      } else {
        Keyboard.println("cmd");
      }
      
      Keyboard.press(KEY_ENTER);
      break;    
  }

  unpressAll();
}

void error( int led ) {
  digitalWrite(led, HIGH);
  delay(500);
  digitalWrite(led, LOW);
  delay(500);
  digitalWrite(led, HIGH);
  delay(500);
  digitalWrite(led, LOW);
  delay(500);
  digitalWrite(led, HIGH);
  delay(500);
  digitalWrite(led, LOW);
  delay(1000);
}
