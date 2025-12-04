def calculate_fertilizer(ideal_n, ideal_p, ideal_k, current_n, current_p, current_k, farm_size, unit):
    """
    Calculates exact kg of Urea, DAP, and MOP needed.
    """
    # 1. Standardize Area to Hectares
    if unit.lower() == 'acre':
        size_in_hectares = farm_size * 0.4047
    elif unit.lower() == 'guntha':
         size_in_hectares = farm_size * 0.0101
    else:
        size_in_hectares = farm_size

    # 2. Calculate Deficit per Hectare (Prevent negatives)
    # If soil has 50 N but needs 120 N, Deficit is 70.
    n_deficit = max(0, ideal_n - current_n)
    p_deficit = max(0, ideal_p - current_p)
    k_deficit = max(0, ideal_k - current_k)

    # 3. Calculate Product Quantities (Standard Formulas)
    # These formulas convert the nutrient deficit (e.g., kg of Nitrogen) 
    # into the physical mass of fertilizer product (e.g., kg of Urea)
    
    # --- UREA for Nitrogen ---
    # Urea is 46% Nitrogen.
    # Formula: kg needed = (Nitrogen Needed / 0.46)
    urea_kg = (n_deficit / 0.46) * size_in_hectares
    
    # --- DAP for Phosphorus ---
    # DAP is 46% Phosphorus (and 18% Nitrogen).
    # Formula: kg needed = (Phosphorus Needed / 0.46)
    dap_kg = (p_deficit / 0.46) * size_in_hectares
    
    # --- MOP for Potassium ---
    # MOP is 60% Potassium.
    # Formula: kg needed = (Potassium Needed / 0.60)
    mop_kg = (k_deficit / 0.60) * size_in_hectares

    return {
        "urea": round(urea_kg, 2),
        "dap": round(dap_kg, 2),
        "mop": round(mop_kg, 2),
        "size_in_hectares": round(size_in_hectares, 2)
    }