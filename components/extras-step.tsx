'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowLeft, ListChecks, BadgeCheck, Settings2, Package, Type } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'

type PartExtras = {
  tolerance?: 'standard' | 'tight' | 'custom'
  customToleranceNote?: string
  threads?: Array<{ id: string; type: string; size: string; qty?: number }>
  inspection?: 'none' | 'basic' | 'FAI' | 'CMM'
  certificates?: { material?: boolean; finish?: boolean; heatTreat?: boolean }
  serialization?: boolean
  customMarking?: string
  cleanRoom?: boolean
  assembly?: boolean
  packaging?: { bagPerPart?: boolean; label?: string }
  notes?: string
}

interface ExtrasStepProps {
  selections: any
  setSelections: (selections: any) => void
  onNext?: () => void
  onPrev?: () => void
}

export function ExtrasStep({ selections, setSelections, onNext, onPrev }: ExtrasStepProps) {
  const extras: PartExtras = useMemo<PartExtras>(
    () => ({
      tolerance: 'standard',
      threads: [],
      inspection: 'none',
      certificates: { material: false, finish: false, heatTreat: false },
      serialization: false,
      customMarking: '',
      cleanRoom: false,
      assembly: false,
      packaging: { bagPerPart: false, label: '' },
      notes: '',
      ...(selections?.extras ?? {})
    }),
    [selections?.extras]
  )

  const updateExtras = (patch: Partial<PartExtras>) => {
    setSelections({
      ...selections,
      extras: { ...extras, ...patch }
    })
  }

  const updateCert = (key: keyof NonNullable<PartExtras['certificates']>, val: boolean) => {
    updateExtras({ certificates: { ...(extras.certificates ?? {}), [key]: val } })
  }

  const updatePackaging = (patch: Partial<NonNullable<PartExtras['packaging']>>) => {
    updateExtras({ packaging: { ...(extras.packaging ?? {}), ...patch } })
  }

  const addThread = () => {
    const id = crypto.randomUUID?.() ?? String(Date.now() + Math.random())
    updateExtras({ threads: [...(extras.threads ?? []), { id, type: '', size: '', qty: 1 }] })
  }

  const updateThread = (id: string, patch: Partial<{ type: string; size: string; qty?: number }>) => {
    const next = (extras.threads ?? []).map(t => (t.id === id ? { ...t, ...patch } : t))
    updateExtras({ threads: next })
  }

  const removeThread = (id: string) => {
    const next = (extras.threads ?? []).filter(t => t.id !== id)
    updateExtras({ threads: next })
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Extras (Part-specific)</h3>
        <p className="text-slate-600 text-sm">Optional engineering and quality options that apply only to this part.</p>
      </div>

      {/* TOLERANCES */}
      <section className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Settings2 className="w-4 h-4" /> Tolerances
        </h4>
        <div className="grid gap-2 sm:grid-cols-3">
          {(['standard', 'tight', 'custom'] as const).map(val => (
            <motion.button
              key={val}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => updateExtras({ tolerance: val })}
              className={`text-left p-2 rounded-lg border-2 transition-all ${
                extras.tolerance === val
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="text-sm font-medium capitalize">{val}</div>
              <p className="text-xs text-slate-500">
                {val === 'standard' && 'General shop tolerances'}
                {val === 'tight' && 'Higher precision, longer lead time'}
                {val === 'custom' && 'Specify GD&T or special callouts'}
              </p>
            </motion.button>
          ))}
        </div>
        {extras.tolerance === 'custom' && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Custom tolerance / GD&amp;T notes</label>
            <Textarea
              value={extras.customToleranceNote ?? ''}
              onChange={e => updateExtras({ customToleranceNote: e.target.value })}
              placeholder="e.g., ±0.02 mm on Ø10, flatness 0.05, datum A/B/C …"
              className="min-h-[70px] text-sm"
            />
          </div>
        )}
      </section>

      {/* THREADS / INSERTS */}
      <section className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <ListChecks className="w-4 h-4" /> Threads / Inserts
        </h4>
        <div className="space-y-2">
          {(extras.threads ?? []).length === 0 ? (
            <p className="text-xs text-slate-500">No threads added.</p>
          ) : (
            <div className="space-y-2">
              {(extras.threads ?? []).map(t => (
                <div key={t.id} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-4">
                    <Input
                      value={t.type}
                      onChange={e => updateThread(t.id, { type: e.target.value })}
                      placeholder="Type (e.g., M6, 1/4-20)"
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="col-span-4">
                    <Input
                      value={t.size}
                      onChange={e => updateThread(t.id, { size: e.target.value })}
                      placeholder="Depth / insert spec"
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      min={1}
                      value={t.qty ?? 1}
                      onChange={e => updateThread(t.id, { qty: Number(e.target.value || 1) })}
                      placeholder="Qty"
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="col-span-1">
                    <Button variant="outline" size="sm" onClick={() => removeThread(t.id)} className="w-full">
                      ✕
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Button variant="outline" size="sm" onClick={addThread}>Add thread/insert</Button>
        </div>
      </section>

      {/* INSPECTION LEVEL */}
      <section className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <BadgeCheck className="w-4 h-4" /> Inspection
        </h4>
        <div className="grid gap-2 sm:grid-cols-4">
          {(['none', 'basic', 'FAI', 'CMM'] as const).map(level => (
            <motion.button
              key={level}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => updateExtras({ inspection: level })}
              className={`text-left p-2 rounded-lg border-2 transition-all ${
                extras.inspection === level
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="text-sm font-medium">{level}</div>
              <p className="text-xs text-slate-500">
                {level === 'none' && 'Visual/fit checks only'}
                {level === 'basic' && 'Key dims spot-check'}
                {level === 'FAI' && 'AS9102 style first article'}
                {level === 'CMM' && 'Dimensional report via CMM'}
              </p>
            </motion.button>
          ))}
        </div>
      </section>

      {/* CERTIFICATES */}
      <section className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Type className="w-4 h-4" /> Certificates
        </h4>
        <div className="grid sm:grid-cols-3 gap-2">
          <label className="flex items-center gap-2">
            <Checkbox
              checked={!!extras.certificates?.material}
              onCheckedChange={(v: boolean) => updateCert('material', !!v)}
            />
            <span className="text-sm text-slate-700">Material cert</span>
          </label>
          <label className="flex items-center gap-2">
            <Checkbox
              checked={!!extras.certificates?.finish}
              onCheckedChange={(v: boolean) => updateCert('finish', !!v)}
            />
            <span className="text-sm text-slate-700">Finish/Coating cert</span>
          </label>
          <label className="flex items-center gap-2">
            <Checkbox
              checked={!!extras.certificates?.heatTreat}
              onCheckedChange={(v: boolean) => updateCert('heatTreat', !!v)}
            />
            <span className="text-sm text-slate-700">Heat-treat cert</span>
          </label>
        </div>
      </section>

      {/* SERIALIZATION / MARKING & CLEAN ROOM / ASSEMBLY */}
      <section className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-700">Identification & Process</h4>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="flex items-center justify-between p-2 rounded-lg border border-slate-200">
            <span className="text-sm text-slate-700">Serialization</span>
            <Switch
              checked={!!extras.serialization}
              onCheckedChange={(v: boolean) => updateExtras({ serialization: !!v })}
            />
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg border border-slate-200">
            <span className="text-sm text-slate-700">Clean room assembly</span>
            <Switch
              checked={!!extras.cleanRoom}
              onCheckedChange={(v: boolean) => updateExtras({ cleanRoom: !!v })}
            />
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg border border-slate-200">
            <span className="text-sm text-slate-700">Assembly services</span>
            <Switch
              checked={!!extras.assembly}
              onCheckedChange={(v: boolean) => updateExtras({ assembly: !!v })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Custom marking / engraving</label>
            <Input
              value={extras.customMarking ?? ''}
              onChange={e => updateExtras({ customMarking: e.target.value })}
              placeholder="Text or marking spec"
              className="h-9 text-sm"
            />
          </div>
        </div>
      </section>

      {/* PACKAGING */}
      <section className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Package className="w-4 h-4" /> Packaging
        </h4>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="flex items-center justify-between p-2 rounded-lg border border-slate-200">
            <span className="text-sm text-slate-700">Bag per part</span>
            <Switch
              checked={!!extras.packaging?.bagPerPart}
              onCheckedChange={(v: boolean) => updatePackaging({ bagPerPart: !!v })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Label text (optional)</label>
            <Input
              value={extras.packaging?.label ?? ''}
              onChange={e => updatePackaging({ label: e.target.value })}
              placeholder="Per-part label"
              className="h-9 text-sm"
            />
          </div>
        </div>
      </section>

      {/* NOTES */}
      <section className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">Part notes (special instructions)</label>
        <Textarea
          value={extras.notes ?? ''}
          onChange={e => updateExtras({ notes: e.target.value })}
          placeholder="Anything else we should know about this part…"
          className="min-h-[70px] text-sm"
        />
      </section>

    </div>
  )
}
