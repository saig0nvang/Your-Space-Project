export function formatReport({ stale, unlinked, outdated, facts }) {
  const lines = []

  if (stale.length > 0) {
    lines.push(`① Tài liệu đã lỗi thời so với quyết định (${stale.length}):`)
    for (const s of stale) {
      lines.push(`  ${s.file}  ←  ${s.id}  (${s.storedHash} → ${s.currentHash})`)
      if (!s.oldAvailable) {
        lines.push('    không truy được bản cũ trong kho object, coi như lỗi thời toàn phần')
        continue
      }
      lines.push(`    ${s.id} đã đổi: +${s.added} / -${s.removed} dòng`)
      for (const l of s.patch.split('\n')) {
        if (/^[+-]/.test(l) && !/^[+-]{3}/.test(l)) lines.push(`    ${l}`)
      }
    }
    lines.push('')
  }

  if (unlinked.length > 0) {
    lines.push(`② Tài liệu chưa vào graph, thiếu derives_from (${unlinked.length}):`)
    for (const f of unlinked) lines.push(`  ${f}`)
    lines.push('  (khai derives_from: [] nếu tài liệu thực sự không phụ thuộc quyết định nào)')
    lines.push('')
  }

  if (outdated.length > 0) {
    lines.push(`③ Tài liệu trỏ tới quyết định đã có bản mới hơn (${outdated.length}):`)
    for (const o of outdated) {
      const verb = o.kind === 'superseded' ? 'bị thay thế bởi' : 'được bổ sung bởi'
      lines.push(`  ${o.file}  ←  ${o.id} ${verb} ${o.replacement.join(', ')}`)
    }
    lines.push('')
  }

  if (facts.length > 0) {
    lines.push(`④ Vi phạm facts.yml (${facts.length}):`)
    for (const f of facts) {
      lines.push(`  ${f.file}:${f.line}  "${f.forbidden}" đã bị loại bỏ, giá trị đúng là "${f.value}" (${f.key})`)
    }
    lines.push('')
  }

  if (lines.length === 0) return 'Sạch — không có tài liệu lỗi thời hay vi phạm.\n'
  return lines.join('\n')
}

export function formatErrors(errors) {
  return ['Lỗi cấu trúc knowledge base:', ...errors.map((e) => `  ${e}`), ''].join('\n')
}
