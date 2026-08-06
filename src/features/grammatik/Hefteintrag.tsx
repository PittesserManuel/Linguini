/**
 * Der Hefteintrag - die Bildschirmfassung dessen, was ins linierte Heft kommt.
 *
 * Vorbild sind handgeschriebene Merkblaetter: Regel oben, Beispiele in der
 * Mitte, Merke-Kasten unten, Wichtig-Zeile zum Schluss. Diese Anordnung ist
 * keine Nostalgie - sie ist die Reihenfolge, in der die Information gebraucht
 * wird, und sie laesst sich Zeile fuer Zeile abschreiben, ohne zu springen.
 *
 * Die Bausteine kommen als Daten (HeftBlock in content/types.ts). Diese Datei
 * kennt nur ihre Darstellung, nicht ihren Inhalt - ein neues Grammatikthema
 * ist damit eine Datenaenderung, kein React-Code.
 */

import type { ReactElement } from 'react'
import type { HeftBild, HeftBlock } from '@/content/types'
import { ObjektBild } from '@/features/wortbild'

function Bildchen({ bild }: { bild: HeftBild }): ReactElement {
  return (
    <span className="hefteintrag__bild">
      <ObjektBild wortId={bild.wortId} anzahl={bild.anzahl} />
    </span>
  )
}

function Block({ block }: { block: HeftBlock }): ReactElement {
  switch (block.art) {
    case 'regel':
      return (
        <div className={`hefteintrag__regel hefteintrag__regel--${block.ton}`}>
          <span className="hefteintrag__pfeil" aria-hidden="true">
            <svg viewBox="0 0 16 16" focusable="false">
              <path d="M2 8 h9 M8 4 l5 4 l-5 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <p className="hefteintrag__regel-text">
            <strong className="hefteintrag__schluesselwort">{block.schluesselwort}</strong> {block.text}
          </p>
          {block.bild && (
            <span className="hefteintrag__regel-bild">
              {block.bild.map((bild, i) => (
                <Bildchen key={i} bild={bild} />
              ))}
            </span>
          )}
        </div>
      )

    case 'kasten':
      return (
        <div className="hefteintrag__kasten">
          {block.titel && <p className="hefteintrag__kasten-titel">{block.titel}</p>}
          {block.zeilen.map((zeile, i) => (
            <p key={i} className="hefteintrag__kasten-zeile">
              {zeile}
            </p>
          ))}
        </div>
      )

    case 'gegenueberstellung':
      return (
        <div className="hefteintrag__gegen">
          <p className="hefteintrag__gegen-titel">{block.titel}</p>
          <ul className="hefteintrag__gegen-liste">
            {block.zeilen.map((zeile, i) => (
              <li key={i} className="hefteintrag__gegen-zeile">
                <div className="hefteintrag__gegen-spalte hefteintrag__gegen-spalte--einzahl">
                  <p className="hefteintrag__satz">{zeile.links}</p>
                  <Bildchen bild={zeile.linksBild} />
                </div>
                <div className="hefteintrag__gegen-spalte hefteintrag__gegen-spalte--mehrzahl">
                  <p className="hefteintrag__satz">{zeile.rechts}</p>
                  <Bildchen bild={zeile.rechtsBild} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )

    case 'genusspalten':
      return (
        <ul className="hefteintrag__spalten">
          {block.spalten.map((spalte) => (
            <li key={spalte.genus} className={`hefteintrag__spalte hefteintrag__spalte--${spalte.genus}`}>
              <p className="hefteintrag__spalte-kopf">
                <span className={`marke--${spalte.genus} hefteintrag__spalte-marke`}>{spalte.genus}</span>
                <span className="hefteintrag__spalte-bezeichnung">({spalte.bezeichnung})</span>
              </p>
              <p className="hefteintrag__spalte-regel">{spalte.regel}</p>
              <ul className="hefteintrag__spalte-beispiele">
                {spalte.beispiele.map((beispiel, i) => (
                  <li key={i}>
                    <p className="hefteintrag__satz">{beispiel.satz}</p>
                    <Bildchen bild={beispiel.bild} />
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )

    case 'merke':
      return (
        <div className="hefteintrag__merke">
          <p className="hefteintrag__merke-titel">
            <span className="hefteintrag__stern" aria-hidden="true">
              <svg viewBox="0 0 16 16" focusable="false">
                <path
                  d="M8 1 l2 4.4 l4.8 .5 l-3.6 3.2 l1 4.7 L8 11.4 L3.8 13.8 l1-4.7 L1.2 5.9 l4.8-.5 Z"
                  fill="currentColor"
                />
              </svg>
            </span>
            Merke
          </p>
          <ul className="hefteintrag__merke-liste">
            {block.zeilen.map((zeile, i) => (
              <li key={i}>{zeile}</li>
            ))}
          </ul>
        </div>
      )

    case 'wichtig':
      return (
        <div className="hefteintrag__wichtig">
          <p className="hefteintrag__wichtig-text">
            <strong>Wichtig:</strong> {block.text}
          </p>
          {block.beispiele && (
            <ul className="hefteintrag__wichtig-beispiele">
              {block.beispiele.map((beispiel, i) => (
                <li key={i}>{beispiel}</li>
              ))}
            </ul>
          )}
        </div>
      )

    default: {
      // Absicherung fuer neue Bausteine: bricht sichtbar, statt still nichts
      // zu rendern (gleiche Haltung wie die Aufgaben-Weiche und die Grader).
      const nieErreicht: never = block
      throw new Error(`Hefteintrag: unbekannter Baustein "${JSON.stringify(nieErreicht)}"`)
    }
  }
}

export function Hefteintrag(props: { titel: string; untertitel: string; bloecke: HeftBlock[] }): ReactElement {
  return (
    <article className="hefteintrag">
      <header className="hefteintrag__kopf">
        <h3 className="hefteintrag__titel">{props.titel}</h3>
        <p className="hefteintrag__untertitel">{props.untertitel}</p>
      </header>
      {props.bloecke.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </article>
  )
}
